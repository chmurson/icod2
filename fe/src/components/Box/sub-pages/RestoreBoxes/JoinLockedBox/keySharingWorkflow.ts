import { loggerGate } from "@icod2/protocols";
import { WorkflowBuilder, WorkflowManager } from "@/services/libp2p/workflows";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import {
  type FollowerSendsPartialStateMessage,
  isLeaderSendsPartialStateMessage,
  isLeaderWelcome,
  type LeaderSendsPartialStateMessage,
} from "../commons/leader-keyholder-interface";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";

export const keySharingWorkflowManager = new WorkflowManager();

const createKeySharingWorkflow = () => {
  return new WorkflowBuilder("keySharing")
    .waitForWithCondition(isLeaderWelcome, () => {
      const { shareAccessKeyByKeyHolderId } = useJoinLockedBoxStore.getState();

      const isThereAnyShared = Object.values(shareAccessKeyByKeyHolderId).some(
        (x) => x === true,
      );

      return isThereAnyShared;
    })
    .waitFor(isLeaderSendsPartialStateMessage, (message, _, proto) => {
      const { connectedLeaderId, shareAccessKeyByKeyHolderId } =
        useJoinLockedBoxStore.getState();

      if (!connectedLeaderId) {
        return;
      }

      const { onlineKeyHolders } = message as LeaderSendsPartialStateMessage;
      const onlineKeyHoldersIds =
        onlineKeyHolders?.map((keyHolder) => keyHolder.id) ?? [];

      const keyHoldersIdsToSharedKeyWith = Object.entries(
        shareAccessKeyByKeyHolderId,
      )
        .filter(
          ([keyHolderId, shared]) =>
            shared && onlineKeyHoldersIds.includes(keyHolderId),
        )
        .map(([keyHolderId]) => keyHolderId);

      const leaderPeerId = usePeerToHolderMapRef
        .getValue()
        .getPeerId(connectedLeaderId);

      if (!leaderPeerId) {
        loggerGate.canError && console.error("Leader peer ID not found");
        return;
      }

      proto.sendMessageToPeer(leaderPeerId, {
        type: "follower:send-partial-state",
        keyHoldersIdsToSharedKeyWith,
      } satisfies FollowerSendsPartialStateMessage);
    })
    .onError((error) => {
      console.error("Key sharing workflow error:", error);

      const state = useJoinLockedBoxStore.getState();
      state.actions.setError(`Workflow error: ${error.message}`);
    });
};

keySharingWorkflowManager.defineWorkflow(createKeySharingWorkflow().build());
keySharingWorkflowManager.startWorkflow("keySharing");
