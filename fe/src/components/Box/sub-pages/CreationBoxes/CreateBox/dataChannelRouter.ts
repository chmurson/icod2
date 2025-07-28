import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useCreateBoxStore } from "@/stores";
import {
  isKeyHolderWelcomesLeader,
  type LeaderNotAuthorizedKeyholder,
  type LeaderWelcomesKeyholder,
} from "../commons";

export const router = new DataChannelMessageRouter();

router.addHandler(
  isKeyHolderWelcomesLeader,
  (localId, message, dataChannelMng) => {
    const {
      actions,
      leader: { id: leaderId },
    } = useCreateBoxStore.getState();

    if (leaderId.trim() !== message.sessionId.trim()) {
      dataChannelMng?.sendMessageToSinglePeer(localId, {
        type: "leader:keyholder-not-athorized",
      } satisfies LeaderNotAuthorizedKeyholder);

      dataChannelMng?.disconnectPeer(localId);

      return;
    }

    actions.connectParticipant({
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
      keyHolderId: localId,
      type: "leader:welcome-keyholder",
    } satisfies LeaderWelcomesKeyholder);
  },
);
