import { useEffect } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore";

export const useShareKeyWithParticipants = (
  sendKey: (participantIds: string[]) => void,
) => {
  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const state = useOpenLockedBoxStore((state) => state.state);
  const you = useOpenLockedBoxStore((state) => state.you);

  useEffect(() => {
    if (
      state === "ready-to-unlock" &&
      Object.values(shareAccessKeyByKeyHolderId).some((x) => x === true)
    ) {
      const idsToShareKey = Object.keys(shareAccessKeyByKeyHolderId).reduce(
        (accumulator, key) => {
          if (shareAccessKeyByKeyHolderId[key] === true && key !== you.id) {
            accumulator[key] = true; //
          }
          return accumulator;
        },
        {} as Record<string, boolean>,
      );

      sendKey(Object.keys(idsToShareKey));
    }
  }, [sendKey, state, shareAccessKeyByKeyHolderId, you.id]);
};
