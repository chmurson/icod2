import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef } from "react";
import {
  ConnectedPeerStorage,
  type IConnectedPeersStorage,
} from "../../libp2p/connected-peer-storage";
import { getBootstrapMultiaddrs } from "../../libp2p/get-bootstrap-multiaddrs";
import {
  type ConnectionErrors,
  createPeerConnectionHandler,
} from "../../libp2p/peer-connection-handler";
import { PersistingDialer } from "../../libp2p/persiting-dialer";
import type { RoomTokenProvider } from "../../libp2p/room-token-provider";
import { startLibp2pService } from "../../libp2p/webrtc-libp2p-service";
import { RelayReconnectDialer } from "../relay-reconnect-dialer";
import { useConnectedRelayState } from "./useConnectedRelayState";

export type Libp2pServiceErrors =
  | "RoomTokenProviderError"
  | "EmptyBootstrapMultiaddrsError"
  | "Libp2pServiceError";

const defaultConnectedPeersStorage = new ConnectedPeerStorage();

export const useLibp2p = <TConnectionFailReason = Libp2pServiceErrors>({
  onPeerConnected,
  onPeerDisconnected,
  onFailedToConnect,
  roomTokenProvider,
  onLibp2pStarted,
  connectedPeersStorage = defaultConnectedPeersStorage,
}: {
  roomTokenProvider: RoomTokenProvider;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onFailedToConnect?: (
    reason: TConnectionFailReason | Libp2pServiceErrors | ConnectionErrors,
  ) => void;
  onLibp2pStarted?: (libp2pService: Libp2p) => void;
  connectedPeersStorage?: IConnectedPeersStorage;
}) => {
  const { relaysConnected, isRelayReconnecting, setRelaysConnected } =
    useConnectedRelayState();
  const libp2pServiceRef = useRef<Libp2p>(undefined);

  const onPeerConnectedRef = useRef(onPeerConnected);
  const onPeerDisconnectedRef = useRef(onPeerDisconnected);
  const onFailedToConnectRef = useRef(onFailedToConnect);
  const onLibp2pStartedRef = useRef(onLibp2pStarted);

  onPeerConnectedRef.current = onPeerConnected;
  onPeerDisconnectedRef.current = onPeerDisconnected;
  onFailedToConnectRef.current = onFailedToConnect;
  onLibp2pStartedRef.current = onLibp2pStarted;

  const handleLibp2pStarted = useCallback((event: CustomEvent<Libp2p>) => {
    onLibp2pStartedRef.current?.(event.detail);
  }, []);

  useEffect(() => {
    connectedPeersStorage.clear();
    let libp2pService: Libp2p;
    let unmounted = false;

    (async () => {
      console.log("Starting libp2p service - stopped:", unmounted);

      const { bootstrapMultiaddrs, relayPeerIds } = getBootstrapMultiaddrs();
      const roomToken = await roomTokenProvider.getRoomToken();

      if (!roomToken) {
        onFailedToConnectRef.current?.("RoomTokenProviderError");
        return;
      }

      if (!(bootstrapMultiaddrs?.length > 0)) {
        onFailedToConnectRef.current?.("EmptyBootstrapMultiaddrsError");
        return;
      }

      if (unmounted) return;

      console.log("start new libp2p service");
      try {
        libp2pService = await startLibp2pService({
          roomToken,
          bootstrapMultiaddrs,
        });
      } catch (error) {
        console.error("Error starting libp2p service:", error);
        onFailedToConnectRef.current?.("Libp2pServiceError");
        return;
      }

      if (unmounted) {
        console.log("Unmointing!");
        libp2pService.stop();
        return;
      }

      onLibp2pStartedRef.current?.(libp2pService);

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
      const relayReconnectDialer = new RelayReconnectDialer(libp2pService, {
        maxRetries: Number.POSITIVE_INFINITY,
      });

      relayReconnectDialer.addOnRelayConnectedListener(() => {
        setRelaysConnected((prev) => ({
          ...prev,
          connected: prev.connected + 1,
        }));
      });

      relayReconnectDialer.addOnRelayDisconnectedListener(() => {
        setRelaysConnected((prev) => ({
          ...prev,
          connected: prev.connected - 1,
        }));
      });

      const peerConnectionHandler = createPeerConnectionHandler({
        handShake: () => new Promise((resolve) => resolve()),
        relayPeerIds,
        persistingDialer,
        connectedPeersStorage,
        onError: (error) => {
          onFailedToConnectRef.current?.(error);
        },
      });

      peerConnectionHandler(libp2pService);
    })();

    return () => {
      unmounted = true;

      // @ts-expect-error
      window.debugPrintConnections = undefined;

      console.log(
        "Closing connections for peer id:",
        libp2pService?.peerId.toString(),
      );

      libp2pService?.removeEventListener("start", handleLibp2pStarted);

      libp2pService?.stop();
    };
  }, [
    roomTokenProvider,
    handleLibp2pStarted,
    connectedPeersStorage,
    setRelaysConnected,
  ]);

  useRaiseErrorIfChanges(null, "null");

  return {
    relaysConnected,
    isRelayReconnecting,
  };
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
