import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import {
  isLeaderError,
  isLeaderOfflineKeyholders,
  isLeaderOnlineKeyholders,
  isLeaderSendsPartialStateMessage,
  isLeaderWelcome,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const router = new DataChannelMessageRouter();

router.addHandler(isLeaderWelcome, (peerId, message) => {
  const actions = useJoinLockedBoxStore.getState().actions;
  usePeerToHolderMapRef.getValue().setPair({ peerId, keyHolderId: message.id });

  actions.connectKeyHolder({
    id: message.id,
    name: message.name,
    userAgent: message.userAgent,
    isLeader: true,
  });
});

router.addHandler(isLeaderError, (_, message) => {
  const actions = useJoinLockedBoxStore.getState().actions;
  actions.setError(message.reason);
});

router.addHandler(isLeaderOnlineKeyholders, (_, message) => {
  const { onlineKeyHolders: newOnlineKeyholders } = message;
  const { actions, you, onlineKeyHolders } = useJoinLockedBoxStore.getState();

  const filtered = newOnlineKeyholders.filter((x) => x.id !== you.id);

  for (const online of filtered) {
    if (!onlineKeyHolders.map((x) => x.id).includes(online.id)) {
      actions.connectKeyHolder(online);
    }
  }
});

router.addHandler(isLeaderOfflineKeyholders, (_, message) => {
  const { offlineKeyHolders: newOfflineKeyholders } = message;
  const { actions, you, offLineKeyHolders } = useJoinLockedBoxStore.getState();

  const filtered = newOfflineKeyholders.filter((x) => x.id !== you.id);

  for (const offline of filtered) {
    if (!offLineKeyHolders.map((x) => x.id).includes(offline.id)) {
      actions.disconnectKeyHolder(offline);
    }
  }
});

router.addHandler(isLeaderSendsPartialStateMessage, (_, message) => {
  const { actions } = useJoinLockedBoxStore.getState();
  actions.setPartialStateUpdate(message);
});
