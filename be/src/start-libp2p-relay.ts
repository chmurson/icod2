import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import type { RoomRegistrationProtocolResponses } from "@icod2/protocols";
import { initRoomRegistrationProtocol, shortenPeerId } from "@icod2/protocols";
import { autoNAT } from "@libp2p/autonat";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import type { Libp2p, PeerId } from "@libp2p/interface";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { createLibp2p } from "libp2p";
import { getLogger } from "./logger.js";
import { starRoomRegistrationServiceStart } from "./services/room-registration.js";
import { debounce } from "./utils/debounce.js";
import { getPeerIdFromEnv } from "./utils/get-or-create-peer-id.js";

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
    connectionManager: {
      maxConnections: 1000,
      inboundUpgradeTimeout: 60_000,
    },
    services: {
      identify: identify(),
      autoNat: autoNAT(),
      relay: circuitRelayServer({
        reservations: {
          maxReservations: 1000, // Default is only 15!
          reservationTtl: 2 * 60 * 60 * 1000, // 2 hours (default is 1 hour)
          defaultDurationLimit: 2 * 60 * 60 * 1000, // 2 hours
          defaultDataLimit: BigInt(1024 * 1024 * 1024), // 1GB (default is 128KB!)
          applyDefaultLimit: false, // Don't enforce limits
        },
        maxInboundHopStreams: 512,
        maxOutboundHopStreams: 512,
        maxOutboundStopStreams: 512,
        hopTimeout: 60_000,
      }),
      pubsub: gossipsub({
        emitSelf: false,
        fallbackToFloodsub: true,
        floodPublish: true,
        doPX: true,
      }),
    },
  });

  const roomRegistration = starRoomRegistrationServiceStart(libp2p);

  const peerId = libp2p.peerId.toString();
  const multiaddrs = libp2p.getMultiaddrs();

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

  libp2p.addEventListener("connection:open", (event) => {
    const { id, remotePeer } = event.detail;
    logger.info(
      {
        connectionId: id,
        remotePeer: shortenPeerId(remotePeer.toString()),
        roomStats: getRoomStats(),
        connections: getConnectionStats(libp2p, remotePeer.toString()),
      },
      "Connection opened",
    );
  });

  libp2p.addEventListener("connection:close", (event) => {
    const { id, remotePeer } = event.detail;
    logger.info(
      {
        connectionId: id,
        remotePeer: shortenPeerId(remotePeer.toString()),
        roomStats: getRoomStats(),
        connections: getConnectionStats(libp2p, remotePeer.toString()),
      },
      "Connection closed",
    );
  });

  const roomRegistrationProt = initRoomRegistrationProtocol(libp2p, {
    onRegisterRoom: async (roomName, peerId) => {
      const peerIdStr = toPeerIdString(peerId);
      try {
        roomRegistration.registerRoom(roomName, peerId);
        logger.info(
          {
            peerId: shortenPeerId(peerIdStr),
            roomName,
            roomStats: getRoomStats(),
          },
          "Room registered",
        );
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
      } satisfies RoomRegistrationProtocolResponses["registerRoomSuccess"]);
      close();
    },
    onUnregisterRoom: async (roomName, peerId) => {
      const peerIdStr = toPeerIdString(peerId);
      roomRegistration.removePeerAndUnregisterRoomInNeeded(peerId);
      const { createPeerConnection } = roomRegistrationProt;
      const { sendResponse, close } = await createPeerConnection(peerId);
      await sendResponse({
        roomName,
        type: "unregister-room-response-success",
      } satisfies RoomRegistrationProtocolResponses["unregisterRoomSuccess"]);
      close();
      logger.info(
        {
          peerId: shortenPeerId(peerIdStr),
          roomName,
          roomStats: getRoomStats(),
        },
        "Room unregistered",
      );
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
        connections: getConnectionStats(libp2p, peerIdStr),
        peers: formatConnectedPeers(connectedPeers),
        registeredRooms: Array.from(roomRegistration.registeredRooms),
        roomStats: getRoomStats(),
      },
      "Peer connected",
    );
  });

  libp2p.addEventListener("peer:disconnect", (event) => {
    const peerIdStr = event.detail.toString();
    connectedPeers.delete(peerIdStr);
    roomRegistration.removePeerAndUnregisterRoomInNeeded(peerIdStr);
    logger.info(
      {
        peerId: shortenPeerId(peerIdStr),
        connections: getConnectionStats(libp2p, peerIdStr),
        peers: formatConnectedPeers(connectedPeers),
        registeredRooms: Array.from(roomRegistration.registeredRooms),
        roomStats: getRoomStats(),
      },
      "Peer disconnected",
    );
  });

  libp2p.addEventListener("peer:update", (event) => {
    const peerIdStr = event.detail.peer.id.toString();
    debouncedLogPeerUpdated(peerIdStr);
  });

  libp2p.services.pubsub.addEventListener("subscription-change", () => {
    debouncedSubscriptionChange();
  });

  function subscriptionChanged() {
    const roomStats = getRoomStats();
    logger.info({ roomStats }, "Subscription changed");
  }

  const debouncedLogPeerUpdated = debounce(peerUpdated, 2000);
  const debouncedSubscriptionChange = debounce(subscriptionChanged, 2000);

  function peerUpdated(peerIdStr: string) {
    logger.info(
      {
        peerId: shortenPeerId(peerIdStr),
        connections: getConnectionStats(libp2p, peerIdStr),
        remainingPeers: formatConnectedPeers(connectedPeers),
        registeredRooms: Array.from(roomRegistration.registeredRooms),
      },
      "Peer updated",
    );
  }

  function getRoomStats() {
    const rooms = Array.from(roomRegistration.registeredRooms.values());

    return rooms.reduce<Record<string, string[]>>((acc, room) => {
      const subscribers = libp2p.services.pubsub
        .getSubscribers(room)
        .map((peerId) => shortenPeerId(peerId.toString()));

      acc[room] = subscribers;

      return acc;
    }, {});
  }

  function formatConnectedPeers(peers: Set<string>): string[] {
    return Array.from(peers.values()).map((peerId) => shortenPeerId(peerId));
  }

  function toPeerIdString(peerId: string | PeerId): string {
    return typeof peerId === "string" ? peerId : peerId.toString();
  }

  function getConnectionStats(libp2p: Libp2p, peerIdStr: string) {
    return libp2p.getConnections().reduce(
      (acc, conn) => {
        const object = acc.find(
          (x) => x.peerId === shortenPeerId(peerIdStr),
        ) ?? {
          peerId: shortenPeerId(conn.remotePeer.toString()),
          connectionCount: 0,
          streamsCount: 0,
        };
        if (object.connectionCount === 0) {
          acc.push(object);
        }
        object.connectionCount += 1;
        object.streamsCount += conn.streams.length;
        return acc;
      },
      [] as { peerId: string; connectionCount: number; streamsCount: number }[],
    );
  }
}
