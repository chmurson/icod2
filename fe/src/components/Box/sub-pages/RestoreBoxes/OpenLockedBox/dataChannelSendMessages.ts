import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type {
  LeaderCounterStart,
  LeaderError,
  LeaderOfflineKeyholders,
  LeaderOnlineKeyholders,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendError = useSendError(dataChannelManagerRef);
  const sendWelcome = useSendWelcome(dataChannelManagerRef);
  const sendOnlineKeyholders = useSendOnlineKeyholders(dataChannelManagerRef);
  const sendOfflineKeyholders = useSendOfflineKeyholders(dataChannelManagerRef);
  const sendCounterStart = useSendCounterStart(dataChannelManagerRef);

  return {
    sendError,
    sendWelcome,
    sendOnlineKeyholders,
    sendOfflineKeyholders,
    sendCounterStart,
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

const useSendOnlineKeyholders = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (onlineKeyHolders: LeaderOnlineKeyholders["onlineKeyHolders"]) => {
      dataChannelManagerRef.current?.sendMessageToAllPeers({
        type: "leader:online-keyholders",
        onlineKeyHolders,
      } satisfies LeaderOnlineKeyholders);
    },
    [dataChannelManagerRef],
  );

const useSendOfflineKeyholders = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (offlineKeyHolders: LeaderOfflineKeyholders["offlineKeyHolders"]) => {
      dataChannelManagerRef.current?.sendMessageToAllPeers({
        type: "leader:offline-keyholders",
        offlineKeyHolders,
      } satisfies LeaderOfflineKeyholders);
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
