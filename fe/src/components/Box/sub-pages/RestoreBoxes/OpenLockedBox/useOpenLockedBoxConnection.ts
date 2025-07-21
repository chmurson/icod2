import { useCallback } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import type {
  LeaderError,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { useCalleeDataChannelMng } from "./useCalleeDataChannelMng";

export function useOpenLockedBoxConnection() {
  const onPeerDisconnected = useCallback((localId: string) => {
    const storeActions = useOpenLockedBoxStore.getState().actions;
    storeActions.disconnectKeyHolder(localId);
  }, []);

  const { dataChannelMngRef } = useCalleeDataChannelMng({ onPeerDisconnected });

  const sendError = useCallback(
    (peerId: string, reason: string) => {
      const errorMsg: LeaderError = {
        type: "leader:error",
        reason,
      };
      dataChannelMngRef.current?.sendMessageToSinglePeer(peerId, errorMsg);
    },
    [dataChannelMngRef],
  );

  const sendWelcome = useCallback(
    (peerId: string, welcomeMsg: LeaderWelcome) => {
      dataChannelMngRef.current?.sendMessageToSinglePeer(peerId, welcomeMsg);
    },
    [dataChannelMngRef],
  );

  return {
    sendError,
    sendWelcome,
  };
}
