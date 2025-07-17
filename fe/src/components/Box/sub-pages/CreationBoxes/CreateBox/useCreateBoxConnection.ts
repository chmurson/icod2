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
      title,
      keyHolderTreshold,
    }: {
      title: string;
      keyHolderTreshold: number;
    }) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:sends-box-update",
        boxInfo: {
          name: title,
          keyHolderTreshold: keyHolderTreshold,
        },
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
