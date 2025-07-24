import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type {
  LeaderError,
  LeaderSendsPartialStateMessage,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendError = useSendError(dataChannelManagerRef);
  const sendWelcome = useSendWelcome(dataChannelManagerRef);
  const sendPartialUpdate = useSendPartialStateUpdate(dataChannelManagerRef);

  return {
    sendError,
    sendWelcome,
    sendPartialUpdate,
  };
};

const useSendError = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (peerId: string, reason: string) => {
      const errorMsg: LeaderError = {
        type: "leader:error",
        reason,
      };
      dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, errorMsg);
    },
    [dataChannelManagerRef],
  );

const useSendWelcome = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (peerId: string) => {
      const { you, onlineKeyHolders } = useOpenLockedBoxStore.getState();

      dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, {
        type: "leader:welcome",
        name: you.name,
        userAgent: you.userAgent,
        id: you.id,
        onlineKeyHolders,
      } satisfies LeaderWelcome);
    },
    [dataChannelManagerRef],
  );

const useSendPartialStateUpdate = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (payload: Omit<LeaderSendsPartialStateMessage, "type">) => {
      dataChannelManagerRef.current?.sendMessageToAllPeers({
        type: "leader:send-partial-state",
        ...payload,
      });
    },
    [dataChannelManagerRef],
  );
