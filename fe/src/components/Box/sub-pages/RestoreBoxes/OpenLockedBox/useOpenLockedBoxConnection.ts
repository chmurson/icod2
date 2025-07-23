import { useCallback } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import type {
  LeaderError,
  LeaderOfflineKeyholders,
  LeaderOnlineKeyholders,
  LeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { useCalleeDataChannelMng } from "./useCalleeDataChannelMng";

export function useOpenLockedBoxConnection() {
  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const onPeerDisconnected = useCallback(
    (peerId: string) => {
      const storeActions = useOpenLockedBoxStore.getState().actions;
      const keyHolderId = peerToKeyHolderMapRef.current.getKeyholerId(peerId);

      if (!keyHolderId) {
        console.warn("keyHolderId not found for peerId: ", peerId);
        return;
      }

      storeActions.disconnectKeyHolder(keyHolderId);
    },
    [peerToKeyHolderMapRef],
  );

  const { dataChannelMngRef } = useCalleeDataChannelMng({
    onPeerDisconnected,
  });

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

  return {
    sendError,
    sendWelcome,
    sendOnlineKeyholders,
    sendOfflineKeyholders,
  };
}
