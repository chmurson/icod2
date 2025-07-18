import { CalleeSignalingService } from "@/services/signaling";
import { useDataChannelMng } from "@/services/webrtc";
import { router } from "../../components/Box/sub-pages/CreationBoxes/CreateBox/dataChannelRouter";

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
