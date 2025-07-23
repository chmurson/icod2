import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import type { FollowerSendsPartialStateMessage } from "../commons";
import type { KeyholderHello } from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendPartialState = useSendPartialState(dataChannelManagerRef);
  const sendHelloToPeer = useSendHelloToPeer(dataChannelManagerRef);

  return {
    sendPartialState,
    sendHelloToPeer,
  };
};

const useSendHelloToPeer = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (peerId: string) => {
      console.log(peerId, "localPeerId");
      const { you } = useJoinLockedBoxStore.getState();

      const msg: KeyholderHello = {
        type: "keyholder:hello",
        userAgent: you.userAgent,
        id: you.id,
      };

      dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, msg);
    },
    [dataChannelManagerRef],
  );

const useSendPartialState = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) => {
  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();
  return useCallback(
    (partialState: Omit<FollowerSendsPartialStateMessage, "type">) => {
      const { connectedLeaderId } = useJoinLockedBoxStore.getState();

      if (!connectedLeaderId) {
        return;
      }

      const peerId = peerToKeyHolderMapRef.current.getPeerId(connectedLeaderId);

      if (!peerId) {
        console.warn(
          "No peer ID found for the connected leader ID:",
          connectedLeaderId,
        );
        return;
      }

      dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, {
        type: "follower:send-partial-state",
        ...partialState,
      } satisfies FollowerSendsPartialStateMessage);
    },
    [dataChannelManagerRef, peerToKeyHolderMapRef],
  );
};
