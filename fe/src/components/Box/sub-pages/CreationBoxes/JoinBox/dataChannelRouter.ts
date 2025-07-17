import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useDownloadBoxStore, useJoinBoxStore } from "@/stores";
import {
  isLeaderSendsBoxCreated,
  isLeaderSendsBoxUpdate,
  isLeaderWelcomesKeyholder,
} from "../commons";

export const router = new DataChannelMessageRouter();

router.addHandler(isLeaderWelcomesKeyholder, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;

  storeActions.connectYou({
    leader: {
      id: message.leaderInfo.name,
      name: message.leaderInfo.name,
      userAgent: message.leaderInfo.userAgent,
    },
    you: {
      id: message.yourId,
    },
  });

  storeActions.setInfoBox({
    title: message.boxInfo.name,
    content: undefined,
    threshold: message.boxInfo.keyHolderTreshold,
  });
});

router.addHandler(isLeaderSendsBoxUpdate, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.setInfoBox({
    title: message.name,
    content: message.content,
    threshold: message.keyHolderTreshold,
  });
});

router.addHandler(isLeaderSendsBoxCreated, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.create({
    encryptedMessage: message.encryptedMessage,
    generatedKey: message.key,
  });

  const { fromJoinBox } = useDownloadBoxStore.getState();
  fromJoinBox();
});
