import { useEffect } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";

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

    calleeConnection.onPeerDisconnected = (peerConnection) => {
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

// further plan:
// peer is -> connection and datachannel
// accept new peers
// remove peer when disconnected
// assign unique local token to each peer
// send json data to all peers
// send json data to single peer
// receive json data from all peers
//
