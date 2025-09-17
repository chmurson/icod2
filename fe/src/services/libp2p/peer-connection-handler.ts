import { loggerGate } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { isEnabled } from "@/utils/featureFlags";
import type { IConnectedPeersStorage } from "./connected-peer-storage";
import type { PersistingDialer } from "./persiting-dialer";

type HandShake = () => Promise<void>;

export type ConnectionErrors = "CannotConnectToRelayPeer";

export const createPeerConnectionHandler = ({
  relayPeerIds,
  connectedPeersStorage,
  handShake,
  persistingDialer,
  onError,
}: {
  relayPeerIds: string[];
  connectedPeersStorage: IConnectedPeersStorage;
  handShake: HandShake;
  persistingDialer: PersistingDialer;
  onError: (error: ConnectionErrors) => void;
}) => {
  const onDialSuccesfully = async (peerIdStr: string) => {
    loggerGate.canLog && console.log(`Successfully dialed peer ${peerIdStr}`);
    const isRelay = relayPeerIds.includes(peerIdStr);

    try {
      await handShake();
      connectedPeersStorage.addPeer(peerIdStr, { isRelay });
    } catch (error) {
      loggerGate.canError &&
        console.error(`Handshake failed for peer ${peerIdStr}: ${error}`);
    }
  };

  persistingDialer.addOnPeerDialedListener((peerIdStr: string) => {
    onDialSuccesfully(peerIdStr);
  });

  return function peerConnectionHandler(libp2p: Libp2p) {
    libp2p.addEventListener("peer:disconnect", (evt) => {
      const peerIdStr = evt.detail.toString();
      loggerGate.canLog && console.log("Peer connected:", peerIdStr);
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

      const isRelayPeerDiscovered = relayPeerIds.includes(discoveredPeerIdStr);
      loggerGate.canLog &&
        console.log(
          `${isRelayPeerDiscovered ? "Relay" : "Regular"} Peer discovered:`,
          evt.detail.id.toString(),
        );

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
        connectedPeersStorage.addPeer(discoveredPeerIdStr, {
          isRelay: isRelayPeerDiscovered,
        });
      } catch (err) {
        if (isRelayPeerDiscovered) {
          loggerGate.canError &&
            console.error(
              `Failed to dial relay peer (${evt.detail.id.toString()}):`,
              err,
            );
          onError("CannotConnectToRelayPeer");
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
