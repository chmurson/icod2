import { useCallback, useRef } from "react";
import type { CallerSignalingService } from "@/services/signaling";
import type { DataChannelManager } from "@/services/webrtc";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import type { KeyholderHello } from "../commons/leader-keyholder-interface";
import { useCallerDataChannelMng } from "./useCallerDataChannelMng";

export function useJoinLockedBoxConnection() {
  const dataChannelManagerRef = useRef<
    DataChannelManager<CallerSignalingService> | undefined
  >(undefined);

  const onPeerConnected = useCallback((localPeerId: string) => {
    const { you, key, encryptedMessage } = useJoinLockedBoxStore.getState();
    const msg: KeyholderHello = {
      type: "keyholder:hello",
      key,
      encryptedMessage,
      userAgent: you.userAgent,
      id: you.id,
    };
    console.log("[JoinLockedBox] Sending keyholder:hello message:", msg);
    dataChannelManagerRef.current?.sendMessageToSinglePeer(localPeerId, msg);
  }, []);

  useCallerDataChannelMng({
    onPeerConnected,
    ref: dataChannelManagerRef,
  });
}
