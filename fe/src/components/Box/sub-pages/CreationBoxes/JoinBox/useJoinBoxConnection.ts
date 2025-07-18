import { useCallback, useRef } from "react";
import {
  type DataChannelManager,
  useCallerDataChannelMng,
} from "@/services/webrtc";
import { useJoinBoxStore } from "@/stores";
import type { KeyHolderWelcomesLeader } from "../commons";

export function useJoinBoxConnection() {
  const dataChannelManagerRef = useRef<DataChannelManager>(undefined);

  const onPeerConnected = useCallback((localPeerId: string) => {
    const { you } = useJoinBoxStore.getState();

    dataChannelManagerRef.current?.sendMessageToSinglePeer(localPeerId, {
      type: "keyholder:welcome-leader",
      name: you.name,
      userAgent: you.userAgent,
    } satisfies KeyHolderWelcomesLeader);
  }, []);

  useCallerDataChannelMng({
    onPeerConnected,
    ref: dataChannelManagerRef,
  });
}
