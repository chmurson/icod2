import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from "@libp2p/bootstrap";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { webTransport } from "@libp2p/webtransport";
import { createLibp2p } from "libp2p";

export async function startLibp2pService({
  roomToken,
  bootstrapMultiaddrs,
}: {
  roomToken: string;
  bootstrapMultiaddrs: string[];
}) {
  const libp2p = await createLibp2pService({ roomToken, bootstrapMultiaddrs });
  await libp2p.start();
  return libp2p;
}

async function createLibp2pService({
  roomToken,
  bootstrapMultiaddrs,
}: {
  roomToken: string;
  bootstrapMultiaddrs: string[];
}) {
  const libp2p = await createLibp2p({
    addresses: {
      listen: [
        // 👇 Required to create circuit relay reservations in order to hole punch browser-to-browser WebRTC connections
        "/p2p-circuit",
        // 👇 Listen for webRTC connection
        "/webrtc",
      ],
    },
    transports: [
      webSockets(),
      webTransport(),
      webRTC(),
      circuitRelayTransport(),
    ],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: async (ma) => {
        if (ma.toString().startsWith("/ip4/127.0.0.1")) {
          return false;
        }
        return false;
      },
    },
    peerDiscovery: [
      bootstrap({
        list: [...bootstrapMultiaddrs],
      }),
      pubsubPeerDiscovery({
        interval: 10_000,
        topics: [roomToken],
      }),
    ],
    services: {
      pubsub: gossipsub(),
      identify: identify(),
    },
  });

  console.log("Libp2p service started. Peer ID:", libp2p.peerId.toString());

  return libp2p;
}
