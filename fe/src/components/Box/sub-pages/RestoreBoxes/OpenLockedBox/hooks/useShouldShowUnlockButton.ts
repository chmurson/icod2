import { useMemo } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore";

export function useShouldShowUnlockButton() {
  const state = useOpenLockedBoxStore((state) => state.state);
  const hasKeyHimself = useOpenLockedBoxStore(
    (state) => state.key?.trim() !== "",
  );

  const receivedKeysNumber = useOpenLockedBoxStore(
    (state) => Object.keys(state.receivedKeysByKeyHolderId ?? {}).length,
  );

  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);

  const hasEnoughtKeysToUnlock = useMemo(() => {
    return receivedKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;
  }, [keyThreshold, receivedKeysNumber, hasKeyHimself]);

  const shouldShowUnlockButton =
    state === "ready-to-unlock" && hasEnoughtKeysToUnlock;

  return { shouldShowUnlockButton };
}
