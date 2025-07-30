import { useCallback } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { useDataChannelMng } from "@/services/webrtc";
import { useCreateBoxStore } from "@/stores";

export function useCreateBoxConnection() {
  const onPeerDisconnected = useCallback((localId: string) => {
    const storeActions = useCreateBoxStore.getState().actions;
    storeActions.disconnectParticipant(localId);
  }, []);

  return useDataChannelMng({
    SignalingService: CalleeSignalingService,
    onPeerDisconnected,
  });
}
