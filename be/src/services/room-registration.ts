import type { GossipsubEvents } from "@chainsafe/libp2p-gossipsub";
import type { Libp2p, PubSub } from "@libp2p/interface";

export const starRoomRegistrationServiceStart = (
  libp2p: Libp2p<{ pubsub: PubSub<GossipsubEvents> }>,
) => {
  const registeredRooms = new Set();
  return {
    registerRoom(roomToken: string) {
      registeredRooms.add(roomToken);
      libp2p.services.pubsub.subscribe(roomToken);
    },

    unregisterRoom(roomToken: string) {
      registeredRooms.delete(roomToken);
      libp2p.services.pubsub.unsubscribe(roomToken);
    },
    registeredRooms,
  };
};
