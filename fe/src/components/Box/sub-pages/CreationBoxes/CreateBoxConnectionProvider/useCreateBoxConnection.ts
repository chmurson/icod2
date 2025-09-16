import type { Libp2p } from "@libp2p/interface";
import { useEffect, useRef, useState } from "react";
import { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import { useRouterManager } from "@/services/libp2p/router-manager";
import {
  type Libp2pServiceErrors,
  useDataChannelMng2,
} from "@/services/libp2p/useDataChannelMng2";
import { useRoomToken } from "../commons/useRoomToken";
import {
  type RoomRegistrationErrors,
  useStartNewRegistrationProtocol,
} from "./useRoomRegistration";

export function useCreateBoxConnection() {
  const [error, setError] = useState<
    RoomRegistrationErrors | Libp2pServiceErrors | ConnectionErrors | undefined
  >(undefined);
  const [roomRegistered, setRoomRegistered] = useState<boolean>(false);
  const { roomTokenProvider } = useRoomToken();

  const connectedPeersStorage = useRef(new ConnectedPeerStorage());
  const libp2p = useRef<Libp2p>(undefined);

  const { tryToRegisterNewRoom, timeoutStart, retry } =
    useStartNewRegistrationProtocol({
      roomTokenProvider: roomTokenProvider,
      onRoomRegistered: () => {
        setRoomRegistered(true);
      },
      onError: (error) => {
        setError(error);
      },
    });

  useEffect(() => {
    connectedPeersStorage.current.addListener(
      "peer-added",
      (peerId, peerInfo) => {
        if (peerInfo.isRelay && libp2p.current) {
          tryToRegisterNewRoom(libp2p.current, peerId);
        }
      },
    );

    connectedPeersStorage.current.addListener("peer-removed", (peerId) => {
      console.log("Peer removed:", peerId);
    });
  }, [tryToRegisterNewRoom]);

  useDataChannelMng2({
    roomTokenProvider: roomTokenProvider,
    connectedPeersStorage: connectedPeersStorage.current,
    onLibp2pStarted: (libp2pInstance) => {
      libp2p.current = libp2pInstance;
      timeoutStart();
    },
    onFailedToConnect: (error) => {
      setError(error);
    },
  });

  const routerMng = useRouterManager();

  return {
    roomRegistered,
    routerMng,
    error,
    retyRoomRegistartion: retry,
  };
}
