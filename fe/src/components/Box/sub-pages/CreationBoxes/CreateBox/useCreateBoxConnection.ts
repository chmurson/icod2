import { useCallback } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { useDataChannelMng } from "@/services/webrtc";
import { useCreateBoxStore } from "@/stores";
import { router } from "./dataChannelRouter";

export function useCreateBoxConnection() {
  const onPeerDisconnected = useCallback((localId: string) => {
    const storeActions = useCreateBoxStore.getState().actions;
    storeActions.disconnectParticipant(localId);
  }, []);

  const { dataChannelMngRef } = useDataChannelMng({
    SignalingService: CalleeSignalingService,
    onPeerDisconnected,
    router,
  });

  return {
    dataChannelMngRef,
  };
}
