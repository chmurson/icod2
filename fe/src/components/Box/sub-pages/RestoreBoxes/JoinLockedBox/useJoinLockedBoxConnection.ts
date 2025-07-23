import { useRef } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";

export function useJoinLockedBoxConnection() {
  const dataChannelManagerRef = useRef<
    DataChannelManager<CallerSignalingService> | undefined
  >(undefined);

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendPartialState, sendHelloToPeer } = useDataChannelSendMessages({
    dataChannelManagerRef,
  });

  useOnChangeShareablePartOfState({ onChange: sendPartialState });

  useDataChannelMng({
    SignalingService: CallerSignalingService,
    ref: dataChannelManagerRef,
    onPeerConnected: (peerId) => {
      sendHelloToPeer(peerId);
    },
    onPeerDisconnected: (peerId) => {
      peerToKeyHolderMapRef.current.removeByPeerId(peerId);
    },
    router: router,
  });

  return { dataChannelManagerRef };
}
