export const starRoomRegistrationServiceStart = (pubsub: {
  subscribe: (topic: string) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
}) => {
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
      pubsub.subscribe(roomToken);
    },

    unregisterRoom(roomToken: string, peerId: string) {
      const peerRoomTokens = getRoomTokens(peerId);

      if (!peerRoomTokens.has(roomToken)) return;
      if (!registeredRooms.has(roomToken)) return;

      if (peerRoomTokens.size === 0) {
        peerIdToRoomTokens.delete(peerId);
      }

      registeredRooms.delete(roomToken);
      pubsub.unsubscribe(roomToken);
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
        pubsub.unsubscribe(roomToken);
      });
    },
    registeredRooms,
  };
};
