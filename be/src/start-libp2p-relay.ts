// @ts-check

import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { initRoomRegistrationProtocol } from "@icod2/protocols";
import { autoNAT } from "@libp2p/autonat";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { getPeerIdFromEnv } from "./utils/get-or-create-peer-id";

export type Args = {
  listenMultiaddrs: string[];
  announceMultiaddrs?: string[];
};

export async function startLibp2pRelay({
  listenMultiaddrs,
  announceMultiaddrs,
}: Args) {
  const privateKey = await getPeerIdFromEnv();

  const libp2p = await createLibp2p({
    privateKey,
    addresses: {
      listen: listenMultiaddrs,
      announce: [...(announceMultiaddrs ?? []), ...listenMultiaddrs],
    },
    transports: [webSockets(), tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      autoNat: autoNAT(),
      relay: circuitRelayServer(),
      pubsub: gossipsub(),
    },
  });

  const peerId = libp2p.peerId.toString();
  const multiaddrs = libp2p.getMultiaddrs();

  const registeredRooms = new Set();

  const roomRegistrationProt = initRoomRegistrationProtocol(libp2p, {
    onRegisterRoom: (roomName) => {
      console.log(`Room registered: ${roomName}`);
      libp2p.services.pubsub.subscribe(roomName);
      registeredRooms.add(roomName);
    },
    onUnregisterRoom: (roomName) => {
      console.log(`Room registered: ${roomName}`);
      libp2p.services.pubsub.unsubscribe(roomName);
      registeredRooms.delete(roomName);
    },
  });
  await roomRegistrationProt.start();

  const connectedPeers = new Set();

  libp2p.addEventListener("peer:connect", (event) => {
    console.log("Peer connected:", event.detail);
    connectedPeers.add(event.detail.toString());
    console.log("Connected peers:", connectedPeers);
  });

  libp2p.addEventListener("peer:disconnect", (event) => {
    console.log("Disconnected peer:", event.detail.toString());
    connectedPeers.delete(event.detail.toString());
    console.log("Connected peers:", connectedPeers);
  });

  console.log("PeerID: ", peerId.toString());
  console.log(
    "Multiaddrs: ",
    multiaddrs.map((ma) => ma.toString()),
  );
}
