import { useCallback } from "react";
import { useCreateBoxStore } from "@/stores";
import type { LeaderSendsBoxCreated, LeaderSendsBoxUpdate } from "../commons";
import { useCalleeDataChannelMng } from "./useCalleeDataChannelMng";

export function useCreateBoxConnection() {
  const onPeerDisconnected = useCallback((localId: string) => {
    const storeActions = useCreateBoxStore.getState().actions;
    storeActions.disconnectParticipant(localId);
  }, []);

  const { dataChannelMngRef } = useCalleeDataChannelMng({ onPeerDisconnected });

  const sendBoxUpdate = useCallback(
    ({
      id,
      title,
      keyHolderTreshold,
      content,
      isContentShared,
    }: {
      title: string;
      keyHolderTreshold: number;
      content?: string;
      id: string;
      isContentShared?: boolean;
    }) => {
      const payload = isContentShared
        ? {
            name: title,
            keyHolderTreshold,
            content,
          }
        : { name: title, keyHolderTreshold };

      dataChannelMngRef.current?.sendMessageToSinglePeer(id, {
        type: "leader:sends-box-update",
        ...payload,
      } satisfies LeaderSendsBoxUpdate);
    },
    [dataChannelMngRef],
  );

  const sendBoxLocked = useCallback(
    ({
      encryptedMessage,
      key,
      localPeerID,
    }: {
      localPeerID: string;
      key: string;
      encryptedMessage: string;
    }) => {
      dataChannelMngRef.current?.sendMessageToSinglePeer(localPeerID, {
        type: "leader:box-created",
        key,
        encryptedMessage,
      } satisfies LeaderSendsBoxCreated);
    },
    [dataChannelMngRef],
  );

  return {
    sendBoxUpdate,
    sendBoxLocked,
  };
}
