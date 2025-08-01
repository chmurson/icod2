import type { RefObject } from "react";
import { CallerSignalingService } from "@/services/signaling";
import type { CallerConnectionFailureReason } from "@/services/signaling/CallerSignalingService";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { router } from "./dataChannelRouter";

export const useCallerDataChannelMng = ({
  onPeerConnected,
  onFailedToConnect,
  ref,
}: {
  onPeerConnected: (localID: string) => void;
  onFailedToConnect: (reason: CallerConnectionFailureReason) => void;
  ref: RefObject<
    | DataChannelManager<CallerSignalingService, CallerConnectionFailureReason>
    | undefined
  >;
}) => {
  useDataChannelMng({
    SignalingService: CallerSignalingService,
    ref,
    onPeerConnected,
    onFailedToConnect,
    router: router,
  });
};
