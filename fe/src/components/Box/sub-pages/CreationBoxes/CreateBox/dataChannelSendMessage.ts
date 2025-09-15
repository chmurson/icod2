import { type RefObject, useCallback } from "react";
import { useCreateBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import type {
  LeaderSendsBoxCreated,
  LeaderSendsBoxUpdate,
  LeaderSendsKeyHolderList,
} from "../commons";

export const useDataChannelSendMessages = ({
  dataChannelManagerRef,
}: {
  dataChannelManagerRef: RefObject<DataChanM | undefined>;
}) => {
  const sendBoxUpdate = useSendBoxUpdate(dataChannelManagerRef);
  const sendBoxCreated = useSendBoxCreated(dataChannelManagerRef);
  const sendKeyholdersUpdate = useSendKeyholdersUpdate(dataChannelManagerRef);
  const sendLockedBoxes = useSendLockedBoxes(dataChannelManagerRef);

  return {
    sendBoxUpdate,
    sendBoxCreated,
    sendKeyholdersUpdate,
    sendLockedBoxes,
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

const useSendLockedBoxes = (
  dataChannelMngRef: RefObject<DataChannelManager | undefined>,
) =>
  useCallback(
    (params: { keys: string[]; encryptedMessage: string }) => {
      const { encryptedMessage, keys } = params;

      const { keyHolders } = useCreateBoxStore.getState();
      const keysToSlice = [...keys];

      keyHolders.forEach((kh) => {
        const peerKey = keysToSlice.pop();

        if (!peerKey) {
          console.error(`Missing key for keyholder with id: ${kh.id}`);
          return;
        }

        dataChannelMngRef.current?.sendMessageToSinglePeer(kh.id, {
          type: "leader:box-created",
          key: peerKey,
          encryptedMessage,
        } satisfies LeaderSendsBoxCreated);
      });
    },
    [dataChannelMngRef],
  );
