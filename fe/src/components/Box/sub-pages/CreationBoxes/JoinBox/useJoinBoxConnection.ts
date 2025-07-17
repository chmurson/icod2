import { useEffect, useMemo } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { DataChannelManager } from "@/services/webrtc";
import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { useJoinBoxStore } from "@/stores";
import {
  isLeaderWelcomesKeyholder,
  type KeyHolderWelcomesLeader,
} from "../commons";

function useMessageRouter() {
  const storeActions = useJoinBoxStore((state) => state.actions);

  const router = useMemo(() => {
    return new DataChannelMessageRouter();
  }, []);

  useEffect(() => {
    router.addHandler(isLeaderWelcomesKeyholder, (_, message) => {
      storeActions.connectYou({
        leader: {
          id: message.leaderInfo.name,
          name: message.leaderInfo.name,
          userAgent: message.leaderInfo.userAgent,
        },
        you: {
          id: message.yourId,
        },
      });
    });

    return () => {
      router.clearHandlers();
    };
  }, [router, storeActions]);

  return router.router;
}

export function useJoinBoxConnection() {
  const messageRouter = useMessageRouter();

  useEffect(() => {
    const dataChannelManager = new DataChannelManager({
      signalingService: new CallerSignalingService(createWebsocketConnection()),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
          const you = useJoinBoxStore.getState().you;

          dataChannelManager.sendMessageToSinglePeer(localId, {
            type: "keyholder:welcome-leader",
            name: you.name,
            userAgent: you.userAgent,
          } satisfies KeyHolderWelcomesLeader);
        },
        onPeerDisconnected: (localId) => {
          console.log("Peer disconnected:", localId);
        },
        onFailedToConnect: (reason) => {
          console.error("Failed to connect:", reason);
        },
        onConnected: () => {
          console.log("Connected to signaling service");
        },
        onDataChannelMessage: messageRouter,
      },
    });

    dataChannelManager.start();

    return () => {
      dataChannelManager.close();
    };
  }, [messageRouter]);
}
