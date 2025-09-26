import { loggerGate } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef } from "react";
import {
  ConnectedPeerStorage,
  type IConnectedPeersStorage,
} from "../core/connected-peer-storage";
import { getBootstrapMultiaddrs } from "../core/get-bootstrap-multiaddrs";
import {
  type ConnectionErrors,
  createPeerConnectionHandler,
} from "../core/peer-connection-handler";
import { PersistingDialer } from "../core/persiting-dialer";
import { RelayReconnectDialer } from "../core/relay-reconnect-dialer";
import { startLibp2pService } from "../core/webrtc-libp2p-service";
import type { RoomTokenProvider } from "..//types";
import { useConnectedRelayState } from "./useConnectedRelayState";

export type Libp2pServiceErrors =
  | "RoomTokenProviderError"
  | "EmptyBootstrapMultiaddrsError"
  | "Libp2pServiceError";

const defaultConnectedPeersStorage = new ConnectedPeerStorage();

export const useLibp2p = <TConnectionFailReason = Libp2pServiceErrors>({
  connectedPeersStorage = defaultConnectedPeersStorage,
  roomTokenProvider,
  onPeerConnected,
  onPeerDisconnected,
  onFailedToConnect,
  onLibp2pStarted,
  onRelayPeerConnected,
  onRelayPeerDisconnected,
  protos,
}: {
  roomTokenProvider: RoomTokenProvider;
  connectedPeersStorage?: IConnectedPeersStorage;
  protos?: { initialize: (libp2p: Libp2p) => void }[];
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onFailedToConnect?: (
    reason: TConnectionFailReason | Libp2pServiceErrors | ConnectionErrors,
  ) => void;
  onLibp2pStarted?: (libp2pService: Libp2p) => void;
  onRelayPeerConnected?: (relayPeerId: string) => void;
  onRelayPeerDisconnected?: (relayPeerId: string) => void;
}) => {
  const { relaysConnected, isRelayReconnecting, setRelaysConnected } =
    useConnectedRelayState();
  const libp2pServiceRef = useRef<Libp2p>(undefined);

  const onPeerConnectedRef = useRef(onPeerConnected);
  const onPeerDisconnectedRef = useRef(onPeerDisconnected);
  const onFailedToConnectRef = useRef(onFailedToConnect);
  const onLibp2pStartedRef = useRef(onLibp2pStarted);
  const onRelayPeerConnectedRef = useRef(onRelayPeerConnected);
  const onRelayPeerDisconnectedRef = useRef(onRelayPeerDisconnected);
  const protosRef = useRef(protos ?? []);

  onPeerConnectedRef.current = onPeerConnected;
  onPeerDisconnectedRef.current = onPeerDisconnected;
  onFailedToConnectRef.current = onFailedToConnect;
  onLibp2pStartedRef.current = onLibp2pStarted;
  onRelayPeerConnectedRef.current = onRelayPeerConnected;
  onRelayPeerDisconnectedRef.current = onRelayPeerDisconnected;

  const handleLibp2pStarted = useCallback((event: CustomEvent<Libp2p>) => {
    onLibp2pStartedRef.current?.(event.detail);
  }, []);

  useEffect(() => {
    connectedPeersStorage.clear();
    let libp2pService: Awaited<ReturnType<typeof startLibp2pService>>;
    let unmounted = false;

    (async () => {
      const { bootstrapMultiaddrs, relayPeerIds } = getBootstrapMultiaddrs();
      const roomToken = roomTokenProvider.getRoomToken();

      if (!roomToken) {
        onFailedToConnectRef.current?.("RoomTokenProviderError");
        loggerGate.canError && console.error("Room token is not available");
        return;
      }

      if (!(bootstrapMultiaddrs?.length > 0)) {
        onFailedToConnectRef.current?.("EmptyBootstrapMultiaddrsError");
        loggerGate.canError &&
          console.error("Bootstrap multiaddrs are not available");
        return;
      }

      if (unmounted) return;

      try {
        libp2pService = await startLibp2pService({
          roomToken,
          bootstrapMultiaddrs,
        });
      } catch (error) {
        loggerGate.canError &&
          console.error("Error starting libp2p service:", error);
        onFailedToConnectRef.current?.("Libp2pServiceError");
        return;
      }

      if (unmounted) {
        loggerGate.canLog && console.log("Unmointing!");
        libp2pService.stop();
        return;
      }

      onLibp2pStartedRef.current?.(libp2pService);

      // @ts-expect-error
      window.debugPrintConnections = () => {
        const peers = libp2pService.getPeers();
        loggerGate.canLog && console.log("Peers:", peers);
        const connections = libp2pService.getConnections();
        const connectionAddrsStats = connections.reduce(
          (acc, connection) => {
            const { remotePeer } = connection;
            const peerIdStr = remotePeer.toString();
            const peerObj = acc[peerIdStr] || [];
            acc[peerIdStr] = peerObj;

            peerObj.push({
              multiPlexer: connection.multiplexer ?? "unknown",
              multiaddr: connection.remoteAddr.toString(),
              status: connection.status,
              streamsCount: connection.streams.length,
            });

            return acc;
          },
          {} as Record<
            string,
            {
              multiPlexer: string;
              multiaddr: string;
              status: string;
              streamsCount: number;
            }[]
          >,
        );
        loggerGate.canLog && console.log("Connections:", connectionAddrsStats);
      };

      // @ts-expect-error
      window.debugTriggerRediscovery = async () => {
        // Temporarily unsubscribe and resubscribe
        libp2pService.services.pubsub.unsubscribe(roomToken);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        libp2pService.services.pubsub.subscribe(roomToken);
      };

      libp2pServiceRef.current = libp2pService;
      const persistingDialer = new PersistingDialer(libp2pService);
      const relayReconnectDialer = new RelayReconnectDialer(libp2pService, {
        maxRetries: Number.POSITIVE_INFINITY,
      });

      relayReconnectDialer.addOnRelayConnectedListener((peerId) => {
        setRelaysConnected((prev) => ({
          ...prev,
          connected: prev.connected + 1,
        }));
        onRelayPeerConnectedRef.current?.(peerId);
      });

      relayReconnectDialer.addOnRelayDisconnectedListener((peerId) => {
        setRelaysConnected((prev) => ({
          ...prev,
          connected: prev.connected - 1,
        }));
        onRelayPeerConnectedRef.current?.(peerId);
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

      for (const proto of protosRef.current) {
        proto.initialize(libp2pService);
      }

      peerConnectionHandler(libp2pService);
    })();

    return () => {
      unmounted = true;

      // @ts-expect-error
      window.debugPrintConnections = undefined;

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
    peerId: libp2pServiceRef.current?.peerId.toString(),
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
