import type { Libp2p } from "@libp2p/interface";
import { useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import { useRouterManager } from "@/services/libp2p/router-manager";
import {
  type Libp2pServiceErrors,
  useLibp2p,
} from "@/services/libp2p/useLibp2p/useLibp2p";
import { useRoomToken } from "../commons/useRoomToken";
import {
  type RoomRegistrationErrors,
  useRoomRegistration,
} from "./useRoomRegistration";

export function useCreateBoxConnection() {
  const [error, setError] = useState<
    RoomRegistrationErrors | Libp2pServiceErrors | ConnectionErrors | undefined
  >(undefined);
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

  const { isRelayReconnecting } = useLibp2p({
    roomTokenProvider: roomTokenProvider,
    connectedPeersStorage: connectedPeersStorage.current,
    onLibp2pStarted: (libp2pInstance) => {
      libp2p.current = libp2pInstance;
    },
    onFailedToConnect: (error) => {
      setError(error);
    },
    protos: [roomRegistrationObject],
  });

  const routerMng = useRouterManager();

  return {
    roomRegistered,
    routerMng,
    error,
    retyRoomRegistartion: roomRegistrationObject.retry,
    isRelayReconnecting,
  };
}
