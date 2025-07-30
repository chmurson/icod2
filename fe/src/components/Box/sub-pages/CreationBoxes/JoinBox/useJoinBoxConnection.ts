import { useCallback, useRef } from "react";
import type { CallerConnectionFailureReason } from "@/services/signaling";
import type { DataChannelManager } from "@/services/webrtc";
import { useJoinBoxStore } from "@/stores";
import type { KeyHolderWelcomesLeader } from "../commons";
import { useCallerDataChannelMng } from "./useCallerDataChannelMng";

export function useJoinBoxConnection() {
  const dataChannelManagerRef = useRef<DataChannelManager>(undefined);

  const onPeerConnected = useCallback((localPeerId: string) => {
    const { you, sessionId } = useJoinBoxStore.getState();

    dataChannelManagerRef.current?.sendMessageToSinglePeer(localPeerId, {
      type: "keyholder:welcome-leader",
      name: you.name,
      userAgent: you.userAgent,
      sessionId,
    } satisfies KeyHolderWelcomesLeader);
  }, []);

  const onFailedToConnect = useCallback(
    (reason: CallerConnectionFailureReason) => {
      if (reason === "timeout-on-creating-offer-and-ice-candidates") {
        useJoinBoxStore.getState().actions.cannotConnectLeader("timeout");
        return;
      }
      useJoinBoxStore.getState().actions.cannotConnectLeader("other");
    },
    [],
  );

  useCallerDataChannelMng({
    onPeerConnected,
    ref: dataChannelManagerRef,
    onFailedToConnect,
  });
}
