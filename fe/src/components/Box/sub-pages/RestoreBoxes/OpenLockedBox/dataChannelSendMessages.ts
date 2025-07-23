import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type {
  LeaderCounterStart,
  LeaderCounterStop,
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
  const sendCounterStart = useSendCounterStart(dataChannelManagerRef);
  const sendCounterStop = useSendCounterStop(dataChannelManagerRef);
  const sendPartialUpdate = useSendPartialStateUpdate(dataChannelManagerRef);

  return {
    sendError,
    sendWelcome,
    sendCounterStart,
    sendCounterStop,
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

const useSendCounterStart = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (unlockingStartDate: LeaderCounterStart["unlockingStartDate"]) => {
      dataChannelManagerRef.current?.sendMessageToAllPeers({
        type: "leader:counter-start",
        unlockingStartDate,
      } satisfies LeaderCounterStart);
    },
    [dataChannelManagerRef],
  );

const useSendCounterStop = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(() => {
    dataChannelManagerRef.current?.sendMessageToAllPeers({
      type: "leader:counter-stop",
    } satisfies LeaderCounterStop);
  }, [dataChannelManagerRef]);
