import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type {
  LeaderError,
  LeaderKey,
  LeaderRelayKey,
  LeaderSendsPartialStateMessage,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendError = useSendError(dataChannelManagerRef);
  const sendWelcome = useSendWelcome(dataChannelManagerRef);
  const sendPartialUpdate = useSendPartialStateUpdate(dataChannelManagerRef);
  const sendKey = useSendKey(dataChannelManagerRef);

  return {
    sendError,
    sendWelcome,
    sendPartialUpdate,
    sendKey,
  };
};

export const relayKey = (
  dataChannelManager: DataChannelManager,
  {
    keyHolderId,
    keyReceiverId,
    keyToRelay,
  }: {
    keyHolderId: string;
    keyReceiverId: string;
    keyToRelay: string;
  },
) => {
  const peerId = usePeerToHolderMapRef.getValue().getPeerId(keyReceiverId);

  if (!peerId) {
    console.warn("No peer ID found for the keyReceiver ID:", keyReceiverId);
    return;
  }

  const msg: LeaderRelayKey = {
    type: "leader:relay-key",
    keyToRelay,
    keyHolderId,
  };

  console.log("SENDING RELAY TO:", peerId);
  dataChannelManager.sendMessageToSinglePeer(peerId, msg);
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

const useSendKey = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) => {
  return useCallback(
    (receiverIds: string[]) => {
      const { you, key } = useOpenLockedBoxStore.getState();

      for (const id of receiverIds) {
        const peerId = usePeerToHolderMapRef.getValue().getPeerId(id);

        if (!peerId) {
          console.warn("No peer ID found for the receiver ID:", id);
          return;
        }

        const msg: LeaderKey = {
          type: "leader:key",
          key: key,
          keyHolderId: you.id,
        };
        dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, msg);
      }
    },
    [dataChannelManagerRef],
  );
};
