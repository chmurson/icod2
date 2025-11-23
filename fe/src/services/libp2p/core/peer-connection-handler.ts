import { loggerGate, shortenPeerId } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import type { Multiaddr } from "@multiformats/multiaddr";
import { featureFlagsManager, isEnabled } from "@/utils/featureFlags";
import type { IConnectedPeersStorage } from "../core/connected-peer-storage";
import type { PersistingDialer } from "./persiting-dialer";
import { startPing } from "./ping";

type HandShake = () => Promise<void>;

export type ConnectionErrors =
  | "CannotConnectToRelayPeer"
  | "CannotConnectToAnyOfRelayPeers";

export const createPeerConnectionHandler = ({
  relayPeerIds,
  connectedPeersStorage,
  handShake,
  persistingDialer,
  onError,
  dontDialDiscoveredPeers = false,
}: {
  relayPeerIds: string[];
  connectedPeersStorage: IConnectedPeersStorage;
  handShake: HandShake;
  persistingDialer: PersistingDialer;
  onError: (error: ConnectionErrors) => void;
  dontDialDiscoveredPeers?: boolean;
}) => {
  return function peerConnectionHandler(libp2p: Libp2p) {
    const onDialSuccesfully = async (peerIdStr: string) => {
      loggerGate.canLog &&
        console.log(`Successfully dialed peer ${shortenPeerId(peerIdStr)}`);
      const isRelay = relayPeerIds.includes(peerIdStr);

      try {
        await handShake();
        connectedPeersStorage.addPeer(peerIdStr, { isRelay });

        startPingService({ peerIdStr, isRelay, libp2p });
      } catch (error) {
        loggerGate.canError &&
          console.error(`Handshake failed for peer ${peerIdStr}: ${error}`);
      }
    };

    persistingDialer.addOnPeerDialedListener((peerIdStr: string) => {
      onDialSuccesfully(peerIdStr);
    });

    let failedConnectionsToRelayPeersCount = 0;
    libp2p.addEventListener("peer:disconnect", (evt) => {
      const peerIdStr = evt.detail.toString();
      loggerGate.canLog &&
        console.log("Peer disconnected:", shortenPeerId(peerIdStr));
      connectedPeersStorage.removePeer(peerIdStr);

      if (relayPeerIds.includes(peerIdStr)) {
        persistingDialer.add(peerIdStr);
      }
    });

    // 👇 Dial peers discovered via pubsub
    libp2p.addEventListener("peer:discovery", async (evt) => {
      // Encapsulate the multiaddrs with the peer ID to ensure correct dialing
      // Should be fixed when https://github.com/libp2p/js-libp2p/issues/3239 is resolved.
      const discoveredPeerIdStr = evt.detail.id.toString();
      const maddrs = evt.detail.multiaddrs.map((ma) =>
        ma.encapsulate(`/p2p/${discoveredPeerIdStr}`),
      );

      const isRelayPeerBasedOnLocalPeerId =
        relayPeerIds.includes(discoveredPeerIdStr);
      let isRelayPeerBasedOnLocalOrRemotePeerId = isRelayPeerBasedOnLocalPeerId;

      loggerGate.canLog &&
        console.log(
          `${isRelayPeerBasedOnLocalOrRemotePeerId ? "Relay" : "Regular"} Peer discovered:`,
          shortenPeerId(discoveredPeerIdStr),
        );

      if (dontDialDiscoveredPeers && !isRelayPeerBasedOnLocalPeerId) {
        console.log("Dialing disabled for discovered peer");
        return;
      }

      if (maddrs.length === 0) {
        loggerGate.canLog && console.log("No multiaddrs to dial");
        persistingDialer.add(discoveredPeerIdStr);
        return;
      }

      try {
        const connection = await libp2p.dial(maddrs);
        if (isEnabled("CLOSE_INITITIAL_PEER_CONNECTION_ASAP")) {
          connection.close();
        }
        const remotePeerId = connection.remotePeer.toString();
        const isRemotePeerRelay = relayPeerIds.includes(remotePeerId);
        isRelayPeerBasedOnLocalOrRemotePeerId =
          isRemotePeerRelay || isRelayPeerBasedOnLocalOrRemotePeerId;

        if (remotePeerId !== discoveredPeerIdStr) {
          loggerGate.canWarn &&
            console.warn(
              `Peer ID is different than local one. We are going to use remote peer ID: ${shortenPeerId(remotePeerId)} [${isRelayPeerBasedOnLocalOrRemotePeerId ? "Relay Peer" : "Non Relay Peer"}]`,
            );
        }

        onDialSuccesfully(remotePeerId);
      } catch (err) {
        if (isRelayPeerBasedOnLocalOrRemotePeerId) {
          loggerGate.canError &&
            console.error(
              `Failed to dial relay peer (${evt.detail.id.toString()}):`,
              err,
            );
          onError("CannotConnectToRelayPeer");
          failedConnectionsToRelayPeersCount++;
          if (failedConnectionsToRelayPeersCount === relayPeerIds.length) {
            onError("CannotConnectToAnyOfRelayPeers");
          }
        } else {
          persistingDialer.add(discoveredPeerIdStr);
          loggerGate.canError &&
            console.error(
              `Failed to dial non-relay peer (${evt.detail.id.toString()}):`,
              err,
            );
        }
      }
    });
  };
};

function startPingService({
  isRelay,
  peerIdStr,
  libp2p,
}: {
  isRelay: boolean;
  peerIdStr: string;
  libp2p: Libp2p;
}) {
  if (!isEnabled("PING_REGULAR_PEERS")) {
    return;
  }
  const multiAddrs = libp2p
    .getConnections()
    .find((c) => c.remotePeer.toString() === peerIdStr)?.remoteAddr;

  if (isRelay) {
    loggerGate.canLog &&
      console.log(`Skip ping for relay peer ${shortenPeerId(peerIdStr)}`);
  } else if (multiAddrs) {
    console.log(
      `Start ping for peer ${shortenPeerId(peerIdStr)} on ${multiAddrs}`,
    );
    startPing(libp2p, [multiAddrs]);
  } else {
    loggerGate.canError &&
      console.warn(
        `No multiaddrs found for peer ${peerIdStr} thus cannot start ping`,
      );
  }
}
