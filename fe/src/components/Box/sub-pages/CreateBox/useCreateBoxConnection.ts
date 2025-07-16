import { useEffect } from "react";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { CalleeSignalingService } from "./CalleeSignalingService";

export function useCreateBoxConnection() {
  useEffect(() => {
    const peers: {
      connection: RTCPeerConnection;
      dataChannel: RTCDataChannel;
    }[] = [];

    const calleeConnection = new CalleeSignalingService(
      createWebsocketConnection(),
    );

    calleeConnection.onPeerConnected = (peerConnection, dataChannel) => {
      peers.push({ connection: peerConnection, dataChannel });
      console.log("peer connected");
    };

    calleeConnection.onPeerDisconneced = (peerConnection) => {
      const index = peers.findIndex((p) => p.connection === peerConnection);
      if (index !== -1) {
        peers.splice(index, 1);
      }
      console.log("peer disconnected");
    };

    calleeConnection.onConnected = () => {
      console.log("connected - waiting peers to get connected");
    };

    calleeConnection.start();

    return () => {
      calleeConnection.close();

      while (peers.length > 0) {
        peers.pop();
      }
    };
  }, []);
}
