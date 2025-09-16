import type { PeerMessageExchangeProtocol } from "@icod2/protocols";
import { PeersMessageRouter } from "@/services/libp2p/peers-message-router";
import { useCreateBoxStore } from "@/stores";
import {
  isKeyHolderWelcomesLeader,
  type LeaderNotAuthorizedKeyholder,
  type LeaderWelcomesKeyholder,
} from "../commons";

export const router = new PeersMessageRouter<
  Record<string, unknown>,
  PeerMessageExchangeProtocol
>();

router.addHandler(isKeyHolderWelcomesLeader, (localId, message, proto) => {
  const {
    actions,
    leader: { id: leaderId },
  } = useCreateBoxStore.getState();

  if (leaderId.trim() !== message.sessionId.trim()) {
    proto.sendMessageToPeer(localId, {
      type: "leader:keyholder-not-athorized",
    } satisfies LeaderNotAuthorizedKeyholder);

    // dataChannelMng?.disconnectPeer(localId);

    return;
  }

  actions.connectParticipant({
    id: localId,
    name: message.name,
    userAgent: message.userAgent,
  });

  const state = useCreateBoxStore.getState();

  proto.sendMessageToPeer(localId, {
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
});
