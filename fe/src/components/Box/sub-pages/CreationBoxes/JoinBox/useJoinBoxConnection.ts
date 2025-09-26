import { useCallback, useEffect } from "react";
import { useFollowerConnection } from "@/services/libp2p/connection-setups";
import { useJoinBoxStore } from "@/stores";
import type { KeyHolderWelcomesLeader } from "../commons";
import { router } from "./joinPeerMessageRouter";

export type JoinBoxConnectionError = ReturnType<
  typeof useJoinBoxConnection
>["error"];

export function useJoinBoxConnection({ roomToken }: { roomToken: string }) {
  const {
    error,
    messageProto,
    isRelayReconnecting,
    routerMng,
    connectedPeersStorageRef,
  } = useFollowerConnection({
    roomToken,
  });

  const onPeerConnected = useCallback(
    (localPeerId: string) => {
      const { you, roomToken } = useJoinBoxStore.getState();

      messageProto.peerMessageProtoRef.current?.sendMessageToPeer(localPeerId, {
        type: "keyholder:welcome-leader",
        name: you.name,
        userAgent: you.userAgent,
        roomToken: roomToken,
      } satisfies KeyHolderWelcomesLeader);
    },
    [messageProto.peerMessageProtoRef],
  );

  const onPeerDisconnected = useCallback((peerId: string) => {
    const { leader, actions } = useJoinBoxStore.getState();
    if (leader.id === peerId) {
      actions.cannotConnectLeader("peer-disconnected");
    }
  }, []);

  useEffect(() => {
    const removeListeners = [
      connectedPeersStorageRef.current.addListener(
        "peer-added",
        (peerId, info) => {
          if (!info.isRelay) {
            onPeerConnected(peerId);
          }
        },
      ),

      connectedPeersStorageRef.current.addListener("peer-removed", (peerId) => {
        onPeerDisconnected(peerId);
      }),
    ];

    return () => {
      for (const removeListener of removeListeners) {
        removeListener();
      }
    };
  }, [onPeerConnected, connectedPeersStorageRef, onPeerDisconnected]);

  useEffect(() => {
    routerMng.addRouter("join-create-box", router.router);

    return () => {
      routerMng.removeRouter("join-create-box");
    };
  }, [routerMng]);

  return {
    routerMng,
    error,
    isRelayReconnecting,
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  };
}
