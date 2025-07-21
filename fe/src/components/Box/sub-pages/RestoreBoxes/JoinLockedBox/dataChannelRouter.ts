import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import {
  isLeaderError,
  isLeaderWelcome,
} from "../commons/leader-keyholder-interface";

export const router = new DataChannelMessageRouter();

router.addHandler(isLeaderWelcome, (_, message) => {
  console.log("[JoinLockedBox] Received leader:welcome message:", message);
  const actions = useJoinLockedBoxStore.getState().actions;
  // Update state with leader info and online keyholders
  actions.connectKeyHolder({
    id: message.id,
    name: message.name,
    userAgent: message.userAgent,
  });
});

router.addHandler(isLeaderError, (_, message) => {
  console.log("[JoinLockedBox] Received leader:error message:", message);
  const actions = useJoinLockedBoxStore.getState().actions;
  actions.setError(message.reason);
});
