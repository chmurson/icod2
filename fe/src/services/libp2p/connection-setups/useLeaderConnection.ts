import type { Libp2p } from "@libp2p/interface";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ErrorTypes } from "@/components/Box/sub-pages/RestoreBoxes/OpenLockedBox/useOpenLockedBoxConnection";
import { ConnectedPeerStorage } from "../core/connected-peer-storage";
import { useRouterManager } from "../core/use-router-manager";
import type { RoomTokenProvider } from "../types";
import { useLibp2p } from "../useLibp2p/useLibp2p";
import {
  type PeerMessageExchangeProtocol,
  usePeerMessageProto,
} from "../usePeerMessageProto";
import { useRoomRegistration } from "../useRoomRegistrationProto";
import { type IgnoredErrors, ignoredErrors } from "./ignoredErrors";

export const useLeaderConnection = ({
  roomToken,
}: {
  roomToken: string | undefined;
}) => {
  const [error, setError] = useState<ErrorTypes | undefined>(undefined);

  const setFilteredError = useCallback<typeof setError>((error) => {
    if (!!error && !ignoredErrors.includes(error as IgnoredErrors)) {
      setError(error);
    }
  }, []);

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
      setFilteredError(error);
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
      setFilteredError(error);
    },
    protos: [roomRegistrationObject, messageProto],
  });

  return {
    roomRegistered,
    routerMng,
    error,
    isRelayReconnecting,
    messageProto,
    peerId: libp2p.current?.peerId.toString(),
    connectedPeersStorageRef: connectedPeersStorage,
  };
};
