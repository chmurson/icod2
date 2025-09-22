import { loggerGate, type PeerMessageExchangeProtocol } from "@icod2/protocols";
import { type RefObject, useCallback } from "react";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { createKeyholderHelloHash } from "@/utils/createKeyholderHelloHash";
import type { FollowerSendsPartialStateMessage } from "../commons";
import type {
  KeyholderHello,
  KeyholderKey,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const useDataChannelSendMessages = ({
  peerMessageProtoRef,
}: {
  peerMessageProtoRef: RefObject<PeerMessageExchangeProtocol | undefined>;
}) => {
  const sendPartialState = useSendPartialState(peerMessageProtoRef);
  const sendHelloToPeer = useSendHelloToPeer(peerMessageProtoRef);
  const sendKey = useSendKey(peerMessageProtoRef);

  return {
    sendPartialState,
    sendHelloToPeer,
    sendKey,
  };
};

const useSendHelloToPeer = (
  dataChannelManagerRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) =>
  useCallback(
    async (peerId: string) => {
      const {
        you,
        encryptedMessage,
        keyThreshold,
        offLineKeyHolders,
        onlineKeyHolders,
      } = useJoinLockedBoxStore.getState();

      const hash = await createKeyholderHelloHash({
        encryptedMessage: encryptedMessage,
        numberOfKeys: offLineKeyHolders.length + onlineKeyHolders.length,
        threshold: keyThreshold,
        allKeyHoldersId: [
          ...offLineKeyHolders.map((x) => x.id),
          ...onlineKeyHolders.map((x) => x.id),
          you.id,
        ],
      });

      const msg: KeyholderHello = {
        type: "keyholder:hello",
        userAgent: you.userAgent,
        id: you.id,
        hash: hash,
      };

      dataChannelManagerRef.current?.sendMessageToPeer(peerId, msg);
    },
    [dataChannelManagerRef],
  );

const useSendPartialState = (
  dataChannelManagerRef: RefObject<PeerMessageExchangeProtocol | undefined>,
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
        loggerGate.canWarn &&
          console.warn(
            "No peer ID found for the connected leader ID:",
            connectedLeaderId,
          );
        return;
      }

      dataChannelManagerRef.current?.sendMessageToPeer(peerId, {
        type: "follower:send-partial-state",
        ...partialState,
      } satisfies FollowerSendsPartialStateMessage);
    },
    [dataChannelManagerRef, peerToKeyHolderMapRef],
  );
};

const useSendKey = (
  dataChannelManagerRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) => {
  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  return useCallback(() => {
    const { you, key, connectedLeaderId } = useJoinLockedBoxStore.getState();

    if (!connectedLeaderId) {
      return;
    }

    const peerId = peerToKeyHolderMapRef.current.getPeerId(connectedLeaderId);

    if (!peerId) {
      loggerGate.canWarn &&
        console.warn(
          "No peer ID found for the connected leader ID:",
          connectedLeaderId,
        );
      return;
    }

    const msg: KeyholderKey = {
      type: "keyholder:key",
      key: key,
      keyHolderId: you.id,
    };

    dataChannelManagerRef.current?.sendMessageToPeer(peerId, msg);
  }, [dataChannelManagerRef, peerToKeyHolderMapRef.current.getPeerId]);
};
