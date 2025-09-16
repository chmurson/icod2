import type { Libp2p } from "@libp2p/interface";
import { isEnabled } from "@/utils/featureFlags";
import type { IConnectedPeersStorage } from "./connected-peer-storage";
import type { PersistingDialer } from "./persiting-dialer";
import { shortenPeerId } from "./utils/shorten-peer-id";

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
    console.log(`Successfully dialed peer ${peerIdStr}`);
    console.log("Proceeding with handshake");
    const isRelay = relayPeerIds.includes(peerIdStr);

    try {
      await handShake();
      connectedPeersStorage.addPeer(peerIdStr, { isRelay });
    } catch (error) {
      console.error(`Handshake failed for peer ${peerIdStr}: ${error}`);
    }
  };

  persistingDialer.addOnPeerDialedListener((peerIdStr: string) => {
    onDialSuccesfully(peerIdStr);
  });

  return function peerConnectionHandler(libp2p: Libp2p) {
    libp2p.addEventListener("peer:disconnect", (evt) => {
      const peerIdStr = evt.detail.toString();
      console.log("Peer connected:", peerIdStr);
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
      console.log("peer:discovery event", shortenPeerId(discoveredPeerIdStr));
      const maddrs = evt.detail.multiaddrs.map((ma) =>
        ma.encapsulate(`/p2p/${discoveredPeerIdStr}`),
      );

      const isRelayPeerDiscovered = relayPeerIds.includes(discoveredPeerIdStr);
      if (isRelayPeerDiscovered) {
        console.log("Dialing relay peer");
      } else {
        console.log("Dialing non-relay peer");
      }
      if (maddrs.length === 0) {
        console.log("No multiaddrs to dial");
        persistingDialer.add(discoveredPeerIdStr);
        return;
      }
      try {
        const connection = await libp2p.dial(maddrs);
        if (isEnabled("CLOSE_INITITIAL_PEER_CONNECTION_ASAP")) {
          connection.close();
        }
        if (isRelayPeerDiscovered) {
          console.log("Relay peer connected:", discoveredPeerIdStr);
        } else {
          console.log("Non-relay peer connected:", discoveredPeerIdStr);
        }
        connectedPeersStorage.addPeer(discoveredPeerIdStr, {
          isRelay: isRelayPeerDiscovered,
        });
      } catch (err) {
        if (isRelayPeerDiscovered) {
          console.error(
            `Failed to dial relay peer (${evt.detail.id.toString()}):`,
            err,
          );
          onError("CannotConnectToRelayPeer");
        } else {
          persistingDialer.add(discoveredPeerIdStr);
          console.error(
            `Failed to dial non-relay peer (${evt.detail.id.toString()}):`,
            err,
          );
        }
      }
    });
  };
};
