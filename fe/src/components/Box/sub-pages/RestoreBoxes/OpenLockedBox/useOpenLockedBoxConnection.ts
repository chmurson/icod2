import { useRef } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";

export function useOpenLockedBoxConnection() {
  const dataChannelManagerRef = useRef<
    DataChannelManager<CalleeSignalingService> | undefined
  >(undefined);
  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendWelcome, sendPartialUpdate } = useDataChannelSendMessages({
    dataChannelManagerRef,
  });

  useOnChangeShareablePartOfState({
    onChange: sendPartialUpdate,
  });

  useDataChannelMng({
    SignalingService: CalleeSignalingService,
    router,
    onPeerConnected: (peerId: string) => {
      sendWelcome(peerId);
    },
    onPeerDisconnected: (peerId: string) => {
      const keyHolderId = usePeerToHolderMapRef
        .getValue()
        .getKeyholerId(peerId);
      if (keyHolderId) {
        const { disconnectKeyHolder } =
          useOpenLockedBoxStore.getState().actions;
        disconnectKeyHolder(keyHolderId);
      }
      peerToKeyHolderMapRef.current.removeByPeerId(peerId);
    },
    ref: dataChannelManagerRef,
  });

  return {
    dataChannelManagerRef,
  };
}
