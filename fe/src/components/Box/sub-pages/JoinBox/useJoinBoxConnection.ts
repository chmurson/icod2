import { useEffect } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";

export function useJoinBoxConnection() {
  useEffect(() => {
    let peer:
      | {
          connection: RTCPeerConnection;
          dataChannel: RTCDataChannel;
        }
      | undefined;

    const callerConnection = new CallerSignalingService(
      createWebsocketConnection(),
    );

    callerConnection.onPeerConnected = (peerConnection, dataChannel) => {
      peer = {
        connection: peerConnection,
        dataChannel: dataChannel,
      };
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
      peer?.dataChannel.close();
      peer?.connection.close();
      callerConnection.close();
      peer = undefined;
    };
  }, []);
}
