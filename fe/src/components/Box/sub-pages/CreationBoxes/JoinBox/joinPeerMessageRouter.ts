import type { PeerMessageExchangeProtocol } from "@icod2/protocols";
import { PeersMessageRouter } from "@/services/libp2p";
import { useDownloadBoxStore, useJoinBoxStore } from "@/stores";
import {
  isLeaderNotAuthorizedKeyholder,
  isLeaderSendsBoxCreated,
  isLeaderSendsBoxUpdate,
  isLeaderSendsKeyHolderList,
  isLeaderWelcomesKeyholder,
  type KeyHolderSendsCreatedBoxReceived,
} from "../commons";

export const router = new PeersMessageRouter<
  Record<string, unknown>,
  PeerMessageExchangeProtocol<Record<string, unknown>>
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

router.addHandler(isLeaderSendsBoxCreated, (_, message, proto) => {
  const storeActions = useJoinBoxStore.getState().actions;

  proto.sendMessageToPeer(useJoinBoxStore.getState().leader.id, {
    type: "keyholder:created-box-received",
  } satisfies KeyHolderSendsCreatedBoxReceived);

  storeActions.markAsCreated();

  const { fromJoinBox } = useDownloadBoxStore.getState();
  fromJoinBox({
    encryptedMessage: message.encryptedMessage,
    key: message.key,
    roomToken: useJoinBoxStore.getState().roomToken,
  });
});

router.addHandler(isLeaderSendsKeyHolderList, (_, message) => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.updateKeyHoldersList(message.allKeyHolders);
});

router.addHandler(isLeaderNotAuthorizedKeyholder, () => {
  const storeActions = useJoinBoxStore.getState().actions;
  storeActions.cannotConnectLeader("not-authorized");
});
