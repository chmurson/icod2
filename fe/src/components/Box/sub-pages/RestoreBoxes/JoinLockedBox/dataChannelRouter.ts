import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import {
  isLeaderError,
  isLeaderKey,
  isLeaderRelayKey,
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

router.addHandler(isLeaderRelayKey, (_, message) => {
  const { actions } = useJoinLockedBoxStore.getState();

  const { keyToRelay, keyHolderId } = message;

  actions.addReceivedKey({
    fromKeyHolderId: keyHolderId,
    key: keyToRelay,
  });
});

router.addHandler(isLeaderKey, (_, message) => {
  const { actions } = useJoinLockedBoxStore.getState();

  const { key, keyHolderId } = message;

  actions.addReceivedKey({
    fromKeyHolderId: keyHolderId,
    key,
  });
});
