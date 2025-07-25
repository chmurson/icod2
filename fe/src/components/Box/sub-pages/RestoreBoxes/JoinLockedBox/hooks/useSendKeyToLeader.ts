import { useEffect } from "react";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";

export const useSendKeyToLeader = (sendKey: () => void) => {
  const shareAccessKeyByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );

  const state = useJoinLockedBoxStore((state) => state.state);

  useEffect(() => {
    if (
      state === "ready-to-unlock" &&
      Object.values(shareAccessKeyByKeyHolderId).some((x) => x === true)
    ) {
      sendKey();
    }
  }, [sendKey, state, shareAccessKeyByKeyHolderId]);
};
