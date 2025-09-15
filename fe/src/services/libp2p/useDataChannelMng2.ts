import type { Libp2p } from "@libp2p/interface";
import { useEffect, useRef } from "react";
import { ConnectedPeerStorage } from "../libp2p/connected-peer-storage";
import { getBootstrapMultiaddrs } from "../libp2p/get-bootstrap-multiaddrs";
import { createPeerConnectionHandler } from "../libp2p/peer-connection-handler";
import { PersistingDialer } from "../libp2p/persiting-dialer";
import type { RoomTokenProvider } from "../libp2p/room-token-provider";
import { startLibp2pService } from "../libp2p/webrtc-libp2p-service";

type LocalConnectionFailReasons = "RoomTokenProviderError";

export const useDataChannelMng2 = <TConnectionFailReason = unknown>({
  onPeerConnected,
  onPeerDisconnected,
  onFailedToConnect,
  roomTokenProvider,
}: {
  roomTokenProvider: RoomTokenProvider;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onFailedToConnect?: (
    reason: TConnectionFailReason | LocalConnectionFailReasons,
  ) => void;
}) => {
  const libp2pServiceRef = useRef<Libp2p>(undefined);

  const onPeerConnectedRef = useRef(onPeerConnected);
  const onPeerDisconnectedRef = useRef(onPeerDisconnected);
  const onFailedToConnectRef = useRef(onFailedToConnect);

  onPeerConnectedRef.current = onPeerConnected;
  onPeerDisconnectedRef.current = onPeerDisconnected;
  onFailedToConnectRef.current = onFailedToConnect;

  useEffect(() => {
    let libp2pService: Libp2p;
    let unmounted = false;
    let intervalTimeout: NodeJS.Timeout | undefined;

    (async () => {
      console.log("Starting libp2p service - stopped:", unmounted);

      const { bootstrapMultiaddrs, relayPeerIds } = getBootstrapMultiaddrs();
      const roomToken = await roomTokenProvider.getRoomToken();

      if (!roomToken) {
        onFailedToConnectRef.current?.("RoomTokenProviderError");
        return;
      }

      if (unmounted) return;

      console.log("start new libp2p service");
      libp2pService = await startLibp2pService({
        roomToken,
        bootstrapMultiaddrs,
      });

      if (unmounted) {
        console.log("Unmointing!");
        libp2pService.stop();
        return;
      }

      // @ts-expect-error
      window.debugPrintConnections = () => {
        const peers = libp2pService.getPeers();
        console.log("Peers:", peers);
        const x = libp2pService.getConnections();
        console.log("Connections:", x);
      };

      console.log(
        "libp2p service started with peer Id:",
        libp2pService.peerId.toString(),
      );

      libp2pServiceRef.current = libp2pService;
      const persistingDialer = new PersistingDialer(libp2pService);

      const peerConnectionHandler = createPeerConnectionHandler({
        handShake: () => new Promise((resolve) => resolve()),
        relayPeerIds,
        persistingDialer,
        connectedPeersStorage: new ConnectedPeerStorage(),
      });

      peerConnectionHandler(libp2pService);
    })();

    return () => {
      unmounted = true;

      // @ts-expect-error
      window.debugPrintConnections = undefined;

      if (intervalTimeout) {
        clearInterval(intervalTimeout);
      }

      console.log(
        "Closing connections for peer id:",
        libp2pService?.peerId.toString(),
      );

      libp2pService?.stop();
    };
  }, [roomTokenProvider]);

  useRaiseErrorIfChanges(null, "null");
};

const useRaiseErrorIfChanges = (value: unknown, valueName: string) => {
  const previousValueRef = useRef(value);
  const valueNameRef = useRef(valueName);

  useEffect(() => {
    if (previousValueRef.current !== value) {
      throw new Error(
        `"${valueNameRef.current}": value has changed unexpectedly; this value should not change;`,
      );
    }

    previousValueRef.current = value;
  }, [value]);
};
