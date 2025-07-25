import { useMemo } from "react";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";

export function useShouldShowUnlockButton() {
  const state = useJoinLockedBoxStore((state) => state.state);
  const hasKeyHimself = useJoinLockedBoxStore(
    (state) => state.key?.trim() !== "",
  );

  const receivedKeysNumber = useJoinLockedBoxStore(
    (state) => Object.keys(state.receivedKeysByKeyHolderId ?? {}).length,
  );

  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);

  const hasEnoughKeysToUnlock = useMemo(() => {
    return receivedKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;
  }, [keyThreshold, receivedKeysNumber, hasKeyHimself]);

  const shouldShowUnlockButton =
    state === "ready-to-unlock" && hasEnoughKeysToUnlock;

  return { shouldShowUnlockButton };
}
