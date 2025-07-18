import { useCallback } from "react";
import { useCreateBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import type {
  LeaderSendsBoxCreated,
  LeaderSendsBoxUpdate,
  LeaderSendsKeyHolderList,
} from "../commons";
import { useCalleeDataChannelMng } from "./useCalleeDataChannelMng";

export function useCreateBoxConnection() {
  const onPeerDisconnected = useCallback((localId: string) => {
    const storeActions = useCreateBoxStore.getState().actions;
    storeActions.disconnectParticipant(localId);
  }, []);

  const { dataChannelMngRef } = useCalleeDataChannelMng({ onPeerDisconnected });

  const sendBoxUpdate = useCallback(
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

  const sendBoxLocked = useCallback(
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

  const sendKeyholdersUpdate = useCallback(
    (keyHolders: ParticipantType[]) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:keyholder-list",
        allKeyHolders: keyHolders,
      } satisfies LeaderSendsKeyHolderList);
    },
    [dataChannelMngRef],
  );

  return {
    sendBoxUpdate,
    sendBoxLocked,
    sendKeyholdersUpdate,
  };
}
