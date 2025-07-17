import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useCreateBoxStore } from "@/stores";
import {
  isKeyHolderWelcomesLeader,
  type LeaderWelcomesKeyholder,
} from "../commons";

export const router = new DataChannelMessageRouter();

router.addHandler(
  isKeyHolderWelcomesLeader,
  (localId, message, dataChannelMng) => {
    const storeActions = useCreateBoxStore.getState().actions;

    storeActions.connectParticipant({
      id: localId,
      name: message.name,
      userAgent: message.userAgent,
    });

    const state = useCreateBoxStore.getState();

    dataChannelMng?.sendMessageToSinglePeer(localId, {
      boxInfo: {
        keyHolderThreshold: state.threshold,
        name: state.title,
      },
      leaderInfo: {
        id: state.leader.id,
        name: state.leader.name,
        userAgent: state.leader.userAgent,
      },
      keyHolderID: localId,
      type: "leader:welcome-keyholder",
    } satisfies LeaderWelcomesKeyholder);
  },
);
