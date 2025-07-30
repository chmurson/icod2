import type {
  CallerConnectionFailureReason,
  CallerSignalingService,
} from "@/services/signaling";
import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useDownloadBoxStore, useJoinBoxStore } from "@/stores";
import {
  isLeaderNotAuthorizedKeyholder,
  isLeaderSendsBoxCreated,
  isLeaderSendsBoxUpdate,
  isLeaderSendsKeyHolderList,
  isLeaderWelcomesKeyholder,
} from "../commons";

export const router = new DataChannelMessageRouter<
  CallerSignalingService,
  CallerConnectionFailureReason
>();

router.addHandler(isLeaderWelcomesKeyholder, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;

  storeActions.connectYou({
    leader: {
      id: message.leaderInfo.id,
      name: message.leaderInfo.name,
      userAgent: message.leaderInfo.userAgent,
    },
    you: {
      id: message.keyHolderId,
    },
  });

  storeActions.setInfoBox({
    title: message.boxInfo.name,
    content: undefined,
    threshold: message.boxInfo.keyHolderThreshold,
  });
});

router.addHandler(isLeaderSendsBoxUpdate, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.setInfoBox({
    title: message.name,
    content: message.content,
    threshold: message.keyHolderThreshold,
  });
});

router.addHandler(isLeaderSendsBoxCreated, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.markAsCreated();

  const { fromJoinBox } = useDownloadBoxStore.getState();
  fromJoinBox({ encryptedMessage: message.encryptedMessage, key: message.key });
});

router.addHandler(isLeaderSendsKeyHolderList, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.updateKeyHoldersList(message.allKeyHolders);
});

router.addHandler(isLeaderNotAuthorizedKeyholder, () => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.cannotConnectLeader("not-authorized");
});
