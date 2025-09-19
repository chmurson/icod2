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
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";

export type JoinBoxConnectionError = ReturnType<
  typeof useJoinLockedBoxConnection
>["error"];

export function useJoinLockedBoxConnection({
  roomToken,
}: {
  roomToken: string;
}) {
  const routerMng = useRouterManager<
    Record<string, unknown>,
    PeerMessageExchangeProtocol
  >();

  const messageProto = usePeerMessageProto({
    onMessageListener: routerMng.currentCombinedRouter,
  });

  const [error, setError] = useState<
    Libp2pServiceErrors | ConnectionErrors | undefined
  >(undefined);

  const roomTokenProvider = useMemo(
    () =>
      ({
        getRoomToken: () => roomToken,
      }) satisfies RoomTokenProvider,
    [roomToken],
  );

  const connectedPeersStorage = useRef(new ConnectedPeerStorage());
  const libp2p = useRef<Libp2p>(undefined);

  const { isRelayReconnecting } = useLibp2p({
    roomTokenProvider: roomTokenProvider,
    connectedPeersStorage: connectedPeersStorage.current,
    onLibp2pStarted: (libp2pInstance) => {
      libp2p.current = libp2pInstance;
    },
    onFailedToConnect: (error) => {
      setError(error);
    },
    protos: [messageProto],
  });

  useEffect(() => {
    routerMng.addRouter("join-unlock-box", router.router);

    return () => {
      routerMng.removeRouter("join-unlock-box");
    };
  }, [routerMng]);

  // specific to this use case below 👇
  useEffect(() => {
    useJoinLockedBoxStore
      .getState()
      .actions.cannotConnectLeader(error ? "other" : undefined);
  }, [error]);

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendPartialState, sendHelloToPeer } = useDataChannelSendMessages({
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  });

  useOnChangeShareablePartOfState({ onChange: sendPartialState });

  useEffect(() => {
    const listenersToRemove = [
      connectedPeersStorage.current.addListener(
        "peer-added",
        (peerId, info) => {
          if (!info.isRelay) {
            sendHelloToPeer(peerId);
          }
        },
      ),
      connectedPeersStorage.current.addListener("peer-removed", (peerId) => {
        peerToKeyHolderMapRef.current.removeByPeerId(peerId);
        const khId = peerToKeyHolderMapRef.current.getKeyholderId(peerId);
        const leaderKhId = useJoinLockedBoxStore.getState().connectedLeaderId;

        if (khId === leaderKhId) {
          useJoinLockedBoxStore.getState().actions.markAsDisconnected();
        }
      }),
    ];

    return () => {
      for (const removeListener of listenersToRemove) {
        removeListener();
      }
    };
  }, [sendHelloToPeer, peerToKeyHolderMapRef]);

  return {
    routerMng,
    error,
    isRelayReconnecting,
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  };
}
