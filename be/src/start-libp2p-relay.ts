import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { initRoomRegistrationProtocol } from "@icod2/protocols";
import type { Responses } from "@icod2/protocols/src/room-registration-protocol/messages-and-responses";
import { autoNAT } from "@libp2p/autonat";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { starRoomRegistrationServiceStart } from "./services/room-registration";
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

  const roomRegistration = starRoomRegistrationServiceStart(libp2p);

  const peerId = libp2p.peerId.toString();
  const multiaddrs = libp2p.getMultiaddrs();

  const roomRegistrationProt = initRoomRegistrationProtocol(libp2p, {
    onRegisterRoom: async (roomName, peerId) => {
      console.log(`Room registered: ${roomName}`);
      try {
        roomRegistration.registerRoom(roomName);
      } catch (error) {
        console.error(`Error registering room ${roomName}: ${error}`);
      }
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "register-room-response-success",
      } satisfies Responses["registerRoomSuccess"]);
      close();
    },
    onUnregisterRoom: async (roomName) => {
      console.log(`Room registered: ${roomName}`);
      roomRegistration.unregisterRoom(roomName);
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "unregister-room-response-success",
      } satisfies Responses["unregisterRoomSuccess"]);
      close();
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
