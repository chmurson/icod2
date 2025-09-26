import type { Libp2p } from "@libp2p/interface";
import { useCallback, useMemo, useRef, useState } from "react";
import { ConnectedPeerStorage } from "../core/connected-peer-storage";
import type { ConnectionErrors } from "../core/peer-connection-handler";
import { useRouterManager } from "../core/use-router-manager";
import type { RoomTokenProvider } from "../types";
import { type Libp2pServiceErrors, useLibp2p } from "../useLibp2p/useLibp2p";
import {
  type PeerMessageExchangeProtocol,
  usePeerMessageProto,
} from "../usePeerMessageProto";
import { type IgnoredErrors, ignoredErrors } from "./ignoredErrors";

export const useFollowerConnection = ({ roomToken }: { roomToken: string }) => {
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

  const setFilteredError = useCallback<typeof setError>((error) => {
    if (!!error && !ignoredErrors.includes(error as IgnoredErrors)) {
      setError(error);
    }
  }, []);

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
      setFilteredError(error);
    },
    protos: [messageProto],
  });

  return {
    error,
    messageProto,
    libp2p: libp2p.current,
    isRelayReconnecting,
    routerMng,
    connectedPeersStorageRef: connectedPeersStorage,
  };
};
