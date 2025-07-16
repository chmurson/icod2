import { useEffect } from "react";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { CalleeSignalingService } from "./CalleeSignalingService";

export function useCreateBoxConnection() {
  useEffect(() => {
    const peers: RTCPeerConnection[] = [];
    const leaderConnection = new CalleeSignalingService(
      createWebsocketConnection(),
    );

    leaderConnection.onPeerConnected = (peerConnection) => {
      peers.push(peerConnection);
      console.log("peer connected");
    };

    return () => {
      peers.forEach((peer) => peer.close());
      leaderConnection.close();
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
