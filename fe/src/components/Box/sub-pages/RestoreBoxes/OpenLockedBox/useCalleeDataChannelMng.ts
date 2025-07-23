import { CalleeSignalingService } from "@/services/signaling";
import { useDataChannelMng } from "@/services/webrtc";
import { router } from "./dataChannelRouter";

export const useCalleeDataChannelMng = ({
  onPeerDisconnected,
  onPeerConnected,
}: {
  onPeerDisconnected: (peerId: string) => void;
  onPeerConnected?: (peerId: string) => void;
}) => {
  return useDataChannelMng({
    SignalingService: CalleeSignalingService,
    onPeerDisconnected,
    onPeerConnected,
    router,
  });
};
