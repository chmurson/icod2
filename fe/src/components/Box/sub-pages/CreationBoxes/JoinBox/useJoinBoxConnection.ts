import { useEffect } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { DataChannelManager } from "@/services/webrtc";
import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { useJoinBoxStore } from "@/stores";
import {
  isLeaderSendsBoxUpdate,
  isLeaderWelcomesKeyholder,
  type KeyHolderWelcomesLeader,
} from "../commons";

const router = new DataChannelMessageRouter();

router.addHandler(isLeaderWelcomesKeyholder, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;

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

  storeActions.setInfoBox({
    title: message.boxInfo.name,
    content: "",
    threshold: message.boxInfo.keyHolderTreshold,
  });
});

router.addHandler(isLeaderSendsBoxUpdate, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.setInfoBox({
    title: message.boxInfo.name,
    content: "",
    threshold: message.boxInfo.keyHolderTreshold,
  });
});

export function useJoinBoxConnection() {
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
        onDataChannelMessage: router.router,
      },
    });

    dataChannelManager.start();

    return () => {
      dataChannelManager.close();
    };
  }, []);
}
