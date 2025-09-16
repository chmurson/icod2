import type { PeerMessageExchangeProtocol } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import { useRouterManager } from "@/services/libp2p/use-router-manager";
import {
  type Libp2pServiceErrors,
  useLibp2p,
} from "@/services/libp2p/useLibp2p/useLibp2p";
import { useJoinBoxStore } from "@/stores";
import { type KeyHolderWelcomesLeader, useRoomToken } from "../commons";
import { usePeerMessageProto } from "../commons/usePeerMessageProto";
import { router } from "./joinPeerMessageRouter";

export type JoinBoxConnectionError = ReturnType<
  typeof useJoinBoxConnection
>["error"];

export function useJoinBoxConnection() {
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

  const { roomTokenProvider } = useRoomToken();

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

  const onPeerConnected = useCallback(
    (localPeerId: string) => {
      const { you, sessionId } = useJoinBoxStore.getState();

      messageProto.peerMessageProtoRef.current?.sendMessageToPeer(localPeerId, {
        type: "keyholder:welcome-leader",
        name: you.name,
        userAgent: you.userAgent,
        sessionId,
      } satisfies KeyHolderWelcomesLeader);
    },
    [messageProto.peerMessageProtoRef],
  );

  useEffect(() => {
    const removeListener = connectedPeersStorage.current.addListener(
      "peer-added",
      (peerId, info) => {
        if (!info.isRelay) {
          onPeerConnected(peerId);
        }
      },
    );

    return () => {
      removeListener();
    };
  }, [onPeerConnected]);

  useEffect(() => {
    routerMng.addRouter("join-create-box", router.router);

    return () => {
      routerMng.removeRouter("join-create-box");
    };
  }, [routerMng]);

  return {
    routerMng,
    error,
    isRelayReconnecting,
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  };
}
