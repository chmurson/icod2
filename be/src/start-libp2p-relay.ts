import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { initRoomRegistrationProtocol } from "@icod2/protocols";
import type { Responses } from "@icod2/protocols/src/room-registration-protocol/messages-and-responses";
import { autoNAT } from "@libp2p/autonat";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import type { PeerId } from "@libp2p/interface";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { getLogger } from "./logger.js";
import { starRoomRegistrationServiceStart } from "./services/room-registration.js";
import { debounce } from "./utils/debounce.js";
import { getPeerIdFromEnv } from "./utils/get-or-create-peer-id.js";
import { shortenPeerId } from "./utils/shorten-peer-id.js";

export type Args = {
  listenMultiaddrs: string[];
  announceMultiaddrs?: string[];
};

export async function startLibp2pRelay({
  listenMultiaddrs,
  announceMultiaddrs,
}: Args) {
  const logger = getLogger();
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
    logger.info(
      {
        connectionId: id,
        remotePeer: shortenPeerId(remotePeer.toString()),
      },
      "Connection opened",
    );

    printRoomStats();
  });

  libp2p.addEventListener("connection:close", (event) => {
    const { id, remotePeer } = event.detail;
    logger.info(
      {
        connectionId: id,
        remotePeer: shortenPeerId(remotePeer.toString()),
      },
      "Connection closed",
    );
    printRoomStats();
  });

  const roomRegistrationProt = initRoomRegistrationProtocol(libp2p, {
    onRegisterRoom: async (roomName, peerId) => {
      const peerIdStr = toPeerIdString(peerId);
      logger.info(
        {
          peerId: shortenPeerId(peerIdStr),
          roomName,
        },
        "Room registered",
      );
      try {
        roomRegistration.registerRoom(roomName, peerId);
      } catch (error) {
        logger.error(
          {
            err: error,
            peerId: shortenPeerId(peerIdStr),
            roomName,
          },
          "Failed to register room",
        );
      }
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "register-room-response-success",
      } satisfies Responses["registerRoomSuccess"]);
      close();
      printRoomStats();
    },
    onUnregisterRoom: async (roomName, peerId) => {
      const peerIdStr = toPeerIdString(peerId);
      logger.info(
        {
          peerId: shortenPeerId(peerIdStr),
          roomName,
        },
        "Room unregistered",
      );
      roomRegistration.removePeerAndUnregisterRoomInNeeded(peerId);
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "unregister-room-response-success",
      } satisfies Responses["unregisterRoomSuccess"]);
      close();
      printRoomStats();
    },
  });
  await roomRegistrationProt.start();

  const connectedPeers = new Set<string>();

  libp2p.addEventListener("peer:connect", (event) => {
    const peerIdStr = event.detail.toString();
    connectedPeers.add(peerIdStr);
    logger.info(
      {
        peerId: shortenPeerId(peerIdStr),
        connectedPeers: formatConnectedPeers(connectedPeers),
      },
      "Peer connected",
    );

    printRoomStats();
  });

  libp2p.addEventListener("peer:disconnect", (event) => {
    const peerIdStr = event.detail.toString();
    logger.info(
      {
        peerId: shortenPeerId(peerIdStr),
      },
      "Peer disconnected",
    );
    connectedPeers.delete(peerIdStr);
    logger.info(
      {
        connectedPeers: formatConnectedPeers(connectedPeers),
      },
      "Remaining connected peers",
    );
    roomRegistration.removePeerAndUnregisterRoomInNeeded(peerIdStr);
    logger.info(
      {
        registeredRooms: Array.from(roomRegistration.registeredRooms),
      },
      "Room registrations after disconnect",
    );
  });

  logger.info(
    { peerId, shortPeerId: shortenPeerId(peerId) },
    "Relay peer ready",
  );
  logger.info(
    {
      multiaddrs: multiaddrs.map((ma) => ma.toString()),
    },
    "Relay listening on multiaddrs",
  );

  libp2p.services.pubsub.addEventListener("subscription-change", () => {
    debouncePrintRoomStats();
  });

  const debouncePrintRoomStats = debounce(printRoomStats, 2000);

  function printRoomStats() {
    const rooms = Array.from(roomRegistration.registeredRooms.values());
    logger.debug({ rooms }, "Registered rooms snapshot");

    for (const roomName of rooms) {
      const subscribers = libp2p.services.pubsub
        .getSubscribers(roomName)
        .map((peerId) => shortenPeerId(peerId.toString()));

      logger.debug(
        {
          roomName,
          subscribers,
        },
        "Room subscribers snapshot",
      );
    }
  }

  function formatConnectedPeers(peers: Set<string>): string[] {
    return Array.from(peers.values()).map((peerId) => shortenPeerId(peerId));
  }

  function toPeerIdString(peerId: string | PeerId): string {
    return typeof peerId === "string" ? peerId : peerId.toString();
  }
}
