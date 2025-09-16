import { logger, type PeerMessageExchangeProtocol } from "@icod2/protocols";
import { type RefObject, useCallback } from "react";
import { useCreateBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import type {
  LeaderSendsBoxCreated,
  LeaderSendsBoxUpdate,
  LeaderSendsKeyHolderList,
} from "../commons";

export const useDataChannelSendMessages = ({
  peerProtoExchangeRef,
}: {
  peerProtoExchangeRef: RefObject<PeerMessageExchangeProtocol | undefined>;
}) => {
  const sendBoxUpdate = useSendBoxUpdate(peerProtoExchangeRef);
  const sendBoxCreated = useSendBoxCreated(peerProtoExchangeRef);
  const sendKeyholdersUpdate = useSendKeyholdersUpdate(peerProtoExchangeRef);
  const sendLockedBoxes = useSendLockedBoxes(peerProtoExchangeRef);

  return {
    sendBoxUpdate,
    sendBoxCreated,
    sendKeyholdersUpdate,
    sendLockedBoxes,
  };
};

const useSendBoxUpdate = (
  dataChannelMngRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) =>
  useCallback(
    (params: {
      title: string;
      keyHolderThreshold: number;
      content?: string;
      id: string;
      isContentShared?: boolean;
    }) => {
      const { id, title, keyHolderThreshold, content, isContentShared } =
        params;

      const payload = isContentShared
        ? {
            name: title,
            keyHolderThreshold,
            content,
          }
        : { name: title, keyHolderThreshold };

      dataChannelMngRef.current?.sendMessageToPeer(id, {
        type: "leader:sends-box-update",
        ...payload,
      } satisfies LeaderSendsBoxUpdate);
    },
    [dataChannelMngRef],
  );

const useSendBoxCreated = (
  dataChannelMngRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) =>
  useCallback(
    (params: {
      localPeerID: string;
      key: string;
      encryptedMessage: string;
    }) => {
      const { encryptedMessage, key, localPeerID } = params;

      dataChannelMngRef.current?.sendMessageToPeer(localPeerID, {
        type: "leader:box-created",
        key,
        encryptedMessage,
      } satisfies LeaderSendsBoxCreated);
    },
    [dataChannelMngRef],
  );

const useSendKeyholdersUpdate = (
  dataChannelMngRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) =>
  useCallback(
    (keyHolders: ParticipantType[]) => {
      for (const keyHolder of keyHolders) {
        dataChannelMngRef.current?.sendMessageToPeer(keyHolder.id, {
          type: "leader:keyholder-list",
          allKeyHolders: keyHolders,
        } satisfies LeaderSendsKeyHolderList);
      }
    },
    [dataChannelMngRef],
  );

const useSendLockedBoxes = (
  dataChannelMngRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) =>
  useCallback(
    (params: { keys: string[]; encryptedMessage: string }) => {
      const { encryptedMessage, keys } = params;

      const { keyHolders } = useCreateBoxStore.getState();
      const keysToSlice = [...keys];

      keyHolders.forEach((kh) => {
        const peerKey = keysToSlice.pop();

        if (!peerKey) {
          logger.error(`Missing key for keyholder with id: ${kh.id}`);
          return;
        }

        dataChannelMngRef.current?.sendMessageToPeer(kh.id, {
          type: "leader:box-created",
          key: peerKey,
          encryptedMessage,
        } satisfies LeaderSendsBoxCreated);
      });
    },
    [dataChannelMngRef],
  );
