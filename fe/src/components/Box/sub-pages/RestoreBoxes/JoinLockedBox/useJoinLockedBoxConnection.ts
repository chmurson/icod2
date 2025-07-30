import { useRef } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
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
    onFailedToConnect: (reason) => {
      if (reason === "timeout-on-creating-offer-and-ice-candidates") {
        useJoinLockedBoxStore.getState().actions.cannotConnectLeader("timeout");
        return;
      }
      if (reason === "timeout-on-getting-answer-from-callee") {
        useJoinLockedBoxStore.getState().actions.cannotConnectLeader("timeout");
        return;
      }
      if (reason === "peer-connection-state-failed") {
        useJoinLockedBoxStore
          .getState()
          .actions.cannotConnectLeader("peer-connection-failed");
        return;
      }

      useJoinLockedBoxStore.getState().actions.cannotConnectLeader("other");
    },
    onPeerConnected: (peerId) => {
      sendHelloToPeer(peerId);
    },
    onPeerDisconnected: (peerId) => {
      peerToKeyHolderMapRef.current.removeByPeerId(peerId);
      useJoinLockedBoxStore.getState().actions.markAsDisconnected();
    },
    router: router,
  });

  return { dataChannelManagerRef };
}
