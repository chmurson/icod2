import type { Libp2p } from "@libp2p/interface";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";
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

export function useOpenLockedBoxConnection({
  roomToken,
}: {
  roomToken: string | undefined;
}) {
  const [error, setError] = useState<ErrorTypes | undefined>(undefined);
  const [roomRegistered, setRoomRegistered] = useState<boolean>(false);

  const connectedPeersStorage = useRef(new ConnectedPeerStorage());
  const libp2p = useRef<Libp2p>(undefined);

  const roomTokenProvider = useMemo(() => {
    return {
      getRoomToken: () => roomToken ?? "",
    } satisfies RoomTokenProvider;
  }, [roomToken]);

  const roomRegistrationObject = useRoomRegistration({
    connectedPeersStorage: connectedPeersStorage.current,
    roomTokenProvider,
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
