import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import {
  isLeaderCounterStart,
  isLeaderCounterStop,
  isLeaderError,
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

router.addHandler(isLeaderSendsPartialStateMessage, (_, message) => {
  const { actions } = useJoinLockedBoxStore.getState();
  actions.setPartialStateUpdate(message);
});

router.addHandler(isLeaderCounterStart, (_, message) => {
  const { unlockingStartDate } = message;
  const { actions } = useJoinLockedBoxStore.getState();
  actions.setUnlockingStartDate(new Date(unlockingStartDate));
});

router.addHandler(isLeaderCounterStop, (_, __) => {
  const { actions } = useJoinLockedBoxStore.getState();
  actions.setUnlockingStartDate(null);
});
