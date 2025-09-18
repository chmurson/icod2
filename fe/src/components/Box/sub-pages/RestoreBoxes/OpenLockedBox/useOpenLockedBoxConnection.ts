import type { Libp2p } from "@libp2p/interface";
import { useEffect, useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import { useRouterManager } from "@/services/libp2p/use-router-manager";
import {
  type Libp2pServiceErrors,
  useLibp2p,
} from "@/services/libp2p/useLibp2p/useLibp2p";
import {
  type PeerMessageExchangeProtocol,
  usePeerMessageProto,
} from "@/services/libp2p/usePeerMessageProto";
import {
  type RoomRegistrationErrors,
  useRoomRegistration,
  useRoomToken,
} from "@/services/libp2p/useRoomRegistration";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { usePeerToHolderMapRef } from "../commons";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";
import { useSendMessageProto } from "./useSendMessageProto";

export type ErrorTypes =
  | RoomRegistrationErrors
  | Libp2pServiceErrors
  | ConnectionErrors
  | undefined;

export function useOpenLockedBoxConnection() {
  const [error, setError] = useState<ErrorTypes | undefined>(undefined);
  const [roomRegistered, setRoomRegistered] = useState<boolean>(false);
  const { roomTokenProvider } = useRoomToken();

  const connectedPeersStorage = useRef(new ConnectedPeerStorage());
  const libp2p = useRef<Libp2p>(undefined);

  const roomRegistrationObject = useRoomRegistration({
    connectedPeersStorage: connectedPeersStorage.current,
    roomTokenProvider: roomTokenProvider,
    onRoomRegistered: () => {
      setRoomRegistered(true);
    },
    onError: (error) => {
      setError(error);
    },
  });

  const routerMng = useRouterManager<
    Record<string, unknown>,
    PeerMessageExchangeProtocol
  >();

  const messageProto = usePeerMessageProto({
    onMessageListener: routerMng.currentCombinedRouter,
  });

  const { isRelayReconnecting } = useLibp2p({
    roomTokenProvider: roomTokenProvider,
    connectedPeersStorage: connectedPeersStorage.current,
    onLibp2pStarted: (libp2pInstance) => {
      libp2p.current = libp2pInstance;
    },
    onFailedToConnect: (error) => {
      setError(error);
    },
    protos: [roomRegistrationObject, messageProto],
  });

  // specific to this use case below 👇
  useEffect(() => {
    if (!error) {
      return;
    }

    useOpenLockedBoxStore.getState().actions.markAsDisconnected();
  }, [error]);

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendWelcome, sendPartialUpdate } = useSendMessageProto({
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  });

  useOnChangeShareablePartOfState({
    onChange: sendPartialUpdate,
  });

  useEffect(() => {
    const listenersToRemove = [
      connectedPeersStorage.current.addListener(
        "peer-added",
        (peerId, info) => {
          if (info.isRelay) {
            return;
          }
          sendWelcome(peerId);
          useOpenLockedBoxStore.getState().actions.markAsConnected();
        },
      ),
      connectedPeersStorage.current.addListener("peer-removed", (peerId) => {
        const keyHolderId = usePeerToHolderMapRef
          .getValue()
          .getKeyholderId(peerId);

        if (keyHolderId) {
          const { disconnectKeyHolder } =
            useOpenLockedBoxStore.getState().actions;
          disconnectKeyHolder(keyHolderId);
        }

        peerToKeyHolderMapRef.current.removeByPeerId(peerId);
      }),
    ];

    return () => {
      for (const removeListener of listenersToRemove) {
        removeListener();
      }
    };
  }, [peerToKeyHolderMapRef, sendWelcome]);

  return {
    roomRegistered,
    routerMng,
    error,
    retryRoomRegistration: roomRegistrationObject.retry,
    isRelayReconnecting,
    messageProto,
    peerId: libp2p.current?.peerId.toString(),
  };
}
