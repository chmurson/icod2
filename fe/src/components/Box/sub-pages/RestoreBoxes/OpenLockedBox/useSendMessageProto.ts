import { loggerGate } from "@icod2/protocols";
import { type RefObject, useCallback } from "react";
import type { BasicProtoInterface } from "@/services/libp2p";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type {
  LeaderError,
  LeaderKey,
  LeaderRelayKey,
  LeaderSendsPartialStateMessage,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const useSendMessageProto = ({
  peerMessageProtoRef,
}: {
  peerMessageProtoRef: RefObject<
    BasicProtoInterface<Record<string, unknown>> | undefined
  >;
}) => {
  const sendError = useSendError(peerMessageProtoRef);
  const sendWelcome = useSendWelcome(peerMessageProtoRef);
  const sendPartialUpdate = useSendPartialStateUpdate(peerMessageProtoRef);
  const sendKey = useSendKey(peerMessageProtoRef);

  return {
    sendError,
    sendWelcome,
    sendPartialUpdate,
    sendKey,
  };
};

export const relayKey = (
  peerMessageProto: BasicProtoInterface<Record<string, unknown>>,
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
    loggerGate.canWarn &&
      console.warn("No peer ID found for the keyReceiver ID:", keyReceiverId);
    return;
  }

  const msg = {
    type: "leader:relay-key",
    keyToRelay,
    keyHolderId,
  } satisfies LeaderRelayKey;

  peerMessageProto.sendMessageToPeer(peerId, msg);
};

const useSendError = (
  peerMessageProtoRef: RefObject<
    BasicProtoInterface<Record<string, unknown>> | undefined
  >,
) =>
  useCallback(
    (peerId: string, reason: string) => {
      const errorMsg = {
        type: "leader:error",
        reason,
      } satisfies LeaderError;
      peerMessageProtoRef.current?.sendMessageToPeer(peerId, errorMsg);
    },
    [peerMessageProtoRef],
  );

const useSendWelcome = (
  peerMessageProtoRef: RefObject<
    BasicProtoInterface<Record<string, unknown>> | undefined
  >,
) =>
  useCallback(
    (peerId: string) => {
      const { you, onlineKeyHolders } = useOpenLockedBoxStore.getState();

      peerMessageProtoRef.current?.sendMessageToPeer(peerId, {
        type: "leader:welcome",
        name: you.name,
        userAgent: you.userAgent,
        id: you.id,
        onlineKeyHolders,
      } satisfies LeaderWelcome);
    },
    [peerMessageProtoRef],
  );

const useSendPartialStateUpdate = (
  peerMessageProtoRef: RefObject<
    BasicProtoInterface<Record<string, unknown>> | undefined
  >,
) =>
  useCallback(
    (payload: Omit<LeaderSendsPartialStateMessage, "type">) => {
      const { onlineKeyHolders } = useOpenLockedBoxStore.getState();
      for (const onlineKeyHolder of onlineKeyHolders) {
        const peerId = usePeerToHolderMapRef
          .getValue()
          .getPeerId(onlineKeyHolder.id);

        if (!peerId) continue;

        peerMessageProtoRef.current?.sendMessageToPeer(peerId, {
          type: "leader:send-partial-state",
          ...payload,
        });
      }
    },
    [peerMessageProtoRef],
  );

const useSendKey = (
  peerMessageProtoRef: RefObject<
    BasicProtoInterface<Record<string, unknown>> | undefined
  >,
) => {
  return useCallback(
    (receiverIds: string[]) => {
      const { you, key } = useOpenLockedBoxStore.getState();

      for (const id of receiverIds) {
        const peerId = usePeerToHolderMapRef.getValue().getPeerId(id);

        if (!peerId) {
          loggerGate.canWarn &&
            console.warn("No peer ID found for the receiver ID:", id);
          return;
        }

        const msg = {
          type: "leader:key",
          key: key,
          keyHolderId: you.id,
        } satisfies LeaderKey;
        peerMessageProtoRef.current?.sendMessageToPeer(peerId, msg);
      }
    },
    [peerMessageProtoRef],
  );
};
