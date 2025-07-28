import { type RefObject, useCallback } from "react";
import type { DataChannelManager } from "@/services/webrtc";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import type {
  LeaderSendsBoxCreated,
  LeaderSendsBoxUpdate,
  LeaderSendsKeyHolderList,
} from "../commons";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>;
}) => {
  const sendBoxUpdate = useSendBoxUpdate(dataChannelManagerRef);
  const sendBoxCreated = useSendBoxCreated(dataChannelManagerRef);
  const sendKeyholdersUpdate = useSendKeyholdersUpdate(dataChannelManagerRef);
  const sendBoxLocked = useSendBoxLocked(dataChannelManagerRef);

  return {
    sendBoxUpdate,
    sendBoxCreated,
    sendKeyholdersUpdate,
    sendBoxLocked,
  };
};

const useSendBoxUpdate = (
  dataChannelMngRef: RefObject<DataChannelManager | undefined>,
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

      dataChannelMngRef.current?.sendMessageToSinglePeer(id, {
        type: "leader:sends-box-update",
        ...payload,
      } satisfies LeaderSendsBoxUpdate);
    },
    [dataChannelMngRef],
  );

const useSendBoxCreated = (
  dataChannelMngRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (params: {
      localPeerID: string;
      key: string;
      encryptedMessage: string;
    }) => {
      const { encryptedMessage, key, localPeerID } = params;

      dataChannelMngRef.current?.sendMessageToSinglePeer(localPeerID, {
        type: "leader:box-created",
        key,
        encryptedMessage,
      } satisfies LeaderSendsBoxCreated);
    },
    [dataChannelMngRef],
  );

const useSendKeyholdersUpdate = (
  dataChannelMngRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (keyHolders: ParticipantType[]) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:keyholder-list",
        allKeyHolders: keyHolders,
      } satisfies LeaderSendsKeyHolderList);
    },
    [dataChannelMngRef],
  );

const useSendBoxLocked = (
  dataChannelMngRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (params: {
      localPeerID: string;
      key: string;
      encryptedMessage: string;
    }) => {
      const { encryptedMessage, key, localPeerID } = params;

      dataChannelMngRef.current?.sendMessageToSinglePeer(localPeerID, {
        type: "leader:box-created",
        key,
        encryptedMessage,
      } satisfies LeaderSendsBoxCreated);
    },
    [dataChannelMngRef],
  );
