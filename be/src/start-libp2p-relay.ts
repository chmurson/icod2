import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { initRoomRegistrationProtocol, loggerGate } from "@icod2/protocols";
import type { Responses } from "@icod2/protocols/src/room-registration-protocol/messages-and-responses";
import { autoNAT } from "@libp2p/autonat";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { starRoomRegistrationServiceStart } from "./services/room-registration.js";
import { getPeerIdFromEnv } from "./utils/get-or-create-peer-id.js";

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

  libp2p.addEventListener("connection:open", (event) => {
    const { id, remotePeer } = event.detail;
    loggerGate.canLog && console.log("Connection open:", { id, remotePeer });
  });

  libp2p.addEventListener("connection:close", (event) => {
    const { id, remotePeer } = event.detail;
    loggerGate.canLog && console.log("Connection closed:", { id, remotePeer });
  });

  const roomRegistrationProt = initRoomRegistrationProtocol(libp2p, {
    onRegisterRoom: async (roomName, peerId) => {
      loggerGate.canLog && console.log(`Room registered: ${roomName}`);
      try {
        roomRegistration.registerRoom(roomName, peerId);
      } catch (error) {
        loggerGate.canError &&
          console.error(`Error registering room ${roomName}: ${error}`);
      }
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "register-room-response-success",
      } satisfies Responses["registerRoomSuccess"]);
      close();
      loggerGate.canLog &&
        console.log("Registered rooms:", roomRegistration.registeredRooms);
    },
    onUnregisterRoom: async (roomName, peerId) => {
      loggerGate.canLog && console.log(`Room unregistered: ${roomName}`);
      roomRegistration.removePeerAndUnregisterRoomInNeeded(peerId);
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "unregister-room-response-success",
      } satisfies Responses["unregisterRoomSuccess"]);
      close();
      loggerGate.canLog &&
        console.log("Registered rooms:", roomRegistration.registeredRooms);
    },
  });
  await roomRegistrationProt.start();

  const connectedPeers = new Set();

  libp2p.addEventListener("peer:connect", (event) => {
    loggerGate.canLog && console.log("Peer connected:", event.detail);
    connectedPeers.add(event.detail.toString());
    loggerGate.canLog && console.log("Connected peers:", connectedPeers);
  });

  libp2p.addEventListener("peer:disconnect", (event) => {
    const peerIdStr = event.detail.toString();
    loggerGate.canLog && console.log("Disconnected peer:", peerIdStr);
    connectedPeers.delete(peerIdStr);
    loggerGate.canLog && console.log("Connected peers:", connectedPeers);
    roomRegistration.removePeerAndUnregisterRoomInNeeded(peerIdStr);
    loggerGate.canLog &&
      console.log("Registered rooms:", roomRegistration.registeredRooms);
  });

  loggerGate.canLog && console.log("PeerID: ", peerId.toString());
  loggerGate.canLog &&
    console.log(
      "Multiaddrs: ",
      multiaddrs.map((ma) => ma.toString()),
    );
}
