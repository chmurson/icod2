import { useCallback } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import type {
  LeaderCounterStart,
  LeaderError,
  LeaderOfflineKeyholders,
  LeaderOnlineKeyholders,
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

  const sendOnlineKeyholders = useCallback(
    (onlineKeyHolders: LeaderOnlineKeyholders["onlineKeyHolders"]) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:online-keyholders",
        onlineKeyHolders,
      } satisfies LeaderOnlineKeyholders);
    },
    [dataChannelMngRef],
  );

  const sendOfflineKeyholders = useCallback(
    (offlineKeyHolders: LeaderOfflineKeyholders["offlineKeyHolders"]) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:offline-keyholders",
        offlineKeyHolders,
      } satisfies LeaderOfflineKeyholders);
    },
    [dataChannelMngRef],
  );

  const sendCounterStart = useCallback(
    (unlockingStartDate: LeaderCounterStart["unlockingStartDate"]) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:counter-start",
        unlockingStartDate,
      } satisfies LeaderCounterStart);
    },
    [dataChannelMngRef],
  );

  return {
    sendError,
    sendWelcome,
    sendOnlineKeyholders,
    sendOfflineKeyholders,
    sendCounterStart,
  };
}
