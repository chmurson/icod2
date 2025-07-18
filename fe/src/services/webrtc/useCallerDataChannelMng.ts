import type { RefObject } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { router } from "../../components/Box/sub-pages/CreationBoxes/JoinBox/dataChannelRouter";

export const useCallerDataChannelMng = ({
  onPeerConnected,
  ref,
}: {
  onPeerConnected: (localID: string) => void;
  ref: RefObject<DataChannelManager<CallerSignalingService> | undefined>;
}) => {
  useDataChannelMng({
    SignalingService: CallerSignalingService,
    ref,
    onPeerConnected,
    router: router,
  });
};
