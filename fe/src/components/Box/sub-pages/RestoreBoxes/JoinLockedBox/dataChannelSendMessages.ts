import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { createKeyholderHelloHash } from "@/utils/createKeyholderHelloHash";
import type { FollowerSendsPartialStateMessage } from "../commons";
import type {
  KeyholderHello,
  KeyholderKey,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendPartialState = useSendPartialState(dataChannelManagerRef);
  const sendHelloToPeer = useSendHelloToPeer(dataChannelManagerRef);
  const sendKey = useSendKey(dataChannelManagerRef);

  return {
    sendPartialState,
    sendHelloToPeer,
    sendKey,
  };
};

const useSendHelloToPeer = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
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

const useSendKey = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) => {
  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  return useCallback(() => {
    const { you, key, connectedLeaderId } = useJoinLockedBoxStore.getState();

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

    const msg: KeyholderKey = {
      type: "keyholder:key",
      key: key,
      keyHolderId: you.id,
    };

    dataChannelManagerRef.current?.sendMessageToSinglePeer(peerId, msg);
  }, [dataChannelManagerRef, peerToKeyHolderMapRef.current.getPeerId]);
};
