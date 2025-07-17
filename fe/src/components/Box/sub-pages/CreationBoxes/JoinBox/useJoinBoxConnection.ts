import { useEffect, useMemo } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { DataChannelManager } from "@/services/webrtc";
import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { useJoinBoxCreationState } from "@/stores";
import {
  isKeyHolderWelcomesLeader,
  type KeyHolderWelcomesLeader,
} from "../commons";

function useMessageRouter() {
  const storeActions = useJoinBoxCreationState((state) => state.actions);

  const router = useMemo(() => {
    return new DataChannelMessageRouter();
  }, []);

  useEffect(() => {
    router.addHandler(isKeyHolderWelcomesLeader, (localId, message) => {
      storeActions.connectParticipant({
        id: localId,
        name: message.name,
        userAgent: message.userAgent,
      });
    });

    return () => {
      router.clearHandlers();
    };
  }, [router, storeActions]);

  return router.router;
}

export function useJoinBoxConnection() {
  useEffect(() => {
    const dataChannelManager = new DataChannelManager({
      signalingService: new CallerSignalingService(createWebsocketConnection()),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
          const you = useJoinBoxCreationState.getState().you;
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
      },
    });

    dataChannelManager.start();

    return () => {
      dataChannelManager.close();
    };
  }, []);
}
