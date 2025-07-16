import { useEffect } from "react";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { CalleeSignalingService } from "./CalleeSignalingService";

export function useCreateBoxConnection() {
  useEffect(() => {
    const peers: RTCPeerConnection[] = [];
    const calleeConnection = new CalleeSignalingService(
      createWebsocketConnection({ enableLogging: true }),
    );

    calleeConnection.onPeerConnected = (peerConnection) => {
      peers.push(peerConnection);
      console.log("peer connected");
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

// take ws api -> request that accepts offers
// accept response -> that requests are being accepted
// accept offer; consume it; create answer and send it back
// test connection

// on the side of keyholder - not leader
// take ws api -> request that sends offer
// accept response; create offer send it to server
// accept response with answer; consume it;
// test connection
