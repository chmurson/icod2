import { useEffect } from "react";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { CallerSignalingService } from "./CallerSignalingService";

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

    return () => {
      peer?.close();
      callerConnection.close();
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
