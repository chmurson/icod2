import { CalleeSignalingService } from "@/services/signaling";
import { useDataChannelMng } from "@/services/webrtc";
import { router } from "./dataChannelRouter";

export const useCalleeDataChannelMng = ({
  onPeerDisconnected,
}: {
  onPeerDisconnected: (localID: string) => void;
}) => {
  return useDataChannelMng({
    SignalingService: CalleeSignalingService,
    onPeerDisconnected,
    router,
  });
};
