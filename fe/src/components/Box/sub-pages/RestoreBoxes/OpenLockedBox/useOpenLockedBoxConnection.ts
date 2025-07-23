import { useRef } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";

export function useOpenLockedBoxConnection() {
  const dataChannelManagerRef = useRef<
    DataChannelManager<CalleeSignalingService> | undefined
  >(undefined);

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendWelcome } = useDataChannelSendMessages({ dataChannelManagerRef });

  useDataChannelMng({
    SignalingService: CalleeSignalingService,
    router,
    onPeerConnected: (peerId: string) => {
      sendWelcome(peerId);
    },
    onPeerDisconnected: (peerId: string) => {
      peerToKeyHolderMapRef.current.removeByPeerId(peerId);
    },
    ref: dataChannelManagerRef,
  });

  return {
    dataChannelManagerRef,
  };
}
