import { useEffect } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { DataChannelManager } from "@/services/webrtc";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";

export function useJoinBoxConnection() {
  useEffect(() => {
    const dataChannelManager = new DataChannelManager({
      signalingService: new CallerSignalingService(createWebsocketConnection()),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
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
