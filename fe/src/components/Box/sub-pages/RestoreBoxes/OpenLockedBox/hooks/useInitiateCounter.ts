import { useEffect, useRef } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore";

export function useInitiateCounter({
  onStart,
  onStop,
}: {
  onStart: (startDate: Date) => void;
  onStop: () => void;
}) {
  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);
  const you = useOpenLockedBoxStore((state) => state.you);
  const shareAccessKeyMapByKeyholderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyholderId,
  );

  const onStartRef = useRef<(startDate: Date) => void>(undefined);
  const onStopRef = useRef<() => void>(undefined);
  onStartRef.current = onStart;
  onStopRef.current = onStop;

  useEffect(() => {
    const sharesRequiredToStartCounter = keyThreshold - 1;
    if (
      Object.values(shareAccessKeyMapByKeyholderId).filter(
        (accesses) => accesses[you.id],
      ).length >= sharesRequiredToStartCounter
    ) {
      const now = new Date();
      onStartRef.current?.(now);
    } else {
      onStopRef.current?.();
    }
  }, [shareAccessKeyMapByKeyholderId, keyThreshold, you.id]);
}
