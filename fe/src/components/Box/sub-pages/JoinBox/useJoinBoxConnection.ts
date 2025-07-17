import { useEffect } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";

export function useJoinBoxConnection() {
  useEffect(() => {
    let peer: RTCPeerConnection | undefined;

    const callerConnection = new CallerSignalingService(
      createWebsocketConnection(),
    );

    callerConnection.onPeerConnected = (peerConnection) => {
      peer = peerConnection;
      console.log("peer connected");
    };

    callerConnection.onPeerDisconnected = () => {
      peer = undefined;
      console.log("peer disconnected");
    };

    callerConnection.onFailedToConnect = (reason) => {
      console.error("Failed to connect:", reason);
    };

    callerConnection.start();

    return () => {
      peer?.close();
      callerConnection.close();
      peer = undefined;
    };
  }, []);
}
