import { useEffect } from "react";
import { useLeaderConnection } from "@/services/libp2p";
import { useCreateBoxStore } from "@/stores";

export function useCreateBoxConnection({
  roomToken,
}: {
  roomToken: string | undefined;
}) {
  const {
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
    roomRegistered,
    routerMng,
    connectedPeersStorageRef,
  } = useLeaderConnection({ roomToken });

  useEffect(() => {
    const removeListeners = [
      connectedPeersStorageRef.current.addListener("peer-removed", (peerId) => {
        const { disconnectParticipant } = useCreateBoxStore.getState().actions;
        disconnectParticipant(peerId);
      }),
    ];

    return () => {
      for (const removeListener of removeListeners) {
        removeListener();
      }
    };
  }, [connectedPeersStorageRef]);

  return {
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
    roomRegistered,
    routerMng,
  };
}
