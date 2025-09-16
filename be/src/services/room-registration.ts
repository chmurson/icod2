import type { GossipsubEvents } from "@chainsafe/libp2p-gossipsub";
import type { Libp2p, PubSub } from "@libp2p/interface";

export const starRoomRegistrationServiceStart = (
  libp2p: Libp2p<{ pubsub: PubSub<GossipsubEvents> }>,
) => {
  const registeredRooms = new Set<string>();
  const peerIdToRoomTokens = new Map<string, Set<string>>();

  function getRoomTokens(peerId: string): Set<string> {
    return peerIdToRoomTokens.get(peerId) ?? new Set();
  }

  return {
    registerRoom(roomToken: string, peerId: string) {
      const peerRoomTokens = getRoomTokens(peerId);

      if (peerRoomTokens.has(roomToken)) return;
      if (registeredRooms.has(roomToken)) return;

      peerRoomTokens.add(roomToken);
      peerIdToRoomTokens.set(peerId, peerRoomTokens);
      registeredRooms.add(roomToken);
      libp2p.services.pubsub.subscribe(roomToken);
    },

    unregisterRoom(roomToken: string, peerId: string) {
      const peerRoomTokens = getRoomTokens(peerId);

      if (!peerRoomTokens.has(roomToken)) return;
      if (!registeredRooms.has(roomToken)) return;

      if (peerRoomTokens.size === 0) {
        peerIdToRoomTokens.delete(peerId);
      }

      registeredRooms.delete(roomToken);
      libp2p.services.pubsub.unsubscribe(roomToken);
    },

    removePeerAndUnregisterRoomInNeeded(peerId: string) {
      const roomTokens = getRoomTokens(peerId);

      peerIdToRoomTokens.delete(peerId);

      const roomTotensToUnregister = Array.from(roomTokens.values()).filter(
        (roomToken) =>
          Array.from(peerIdToRoomTokens.values()).every(
            (tokens) => !tokens.has(roomToken),
          ),
      );

      roomTotensToUnregister.forEach((roomToken) => {
        registeredRooms.delete(roomToken);
        libp2p.services.pubsub.unsubscribe(roomToken);
      });
    },
    registeredRooms,
  };
};
