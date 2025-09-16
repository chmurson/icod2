import type { Libp2p } from "@libp2p/interface";
import { useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import { useRouterManager } from "@/services/libp2p/router-manager";
import {
  type Libp2pServiceErrors,
  useLibp2p,
} from "@/services/libp2p/useLibp2p/useLibp2p";
import { useRoomToken } from "../commons";

export type JoinBoxConnectionError = ReturnType<
  typeof useJoinBoxConnection
>["error"];

export function useJoinBoxConnection() {
  // const onPeerConnected = useCallback((localPeerId: string) => {
  //   const { you, sessionId } = useJoinBoxStore.getState();

  //   dataChannelManagerRef.current?.sendMessageToSinglePeer(localPeerId, {
  //     type: "keyholder:welcome-leader",
  //     name: you.name,
  //     userAgent: you.userAgent,
  //     sessionId,
  //   } satisfies KeyHolderWelcomesLeader);
  // }, []);

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
  });

  const routerMng = useRouterManager();

  return {
    routerMng,
    error,
    isRelayReconnecting,
  };
}
