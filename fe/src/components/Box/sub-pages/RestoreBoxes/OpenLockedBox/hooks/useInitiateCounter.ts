import { useEffect, useMemo, useRef } from "react";
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

  const sharesRequiredToStartCounter = keyThreshold - 1;

  const isTresholdReached = useMemo(() => {
    return (
      Object.values(shareAccessKeyMapByKeyholderId).filter(
        (accesses) => accesses[you.id],
      ).length >= sharesRequiredToStartCounter
    );
  }, [sharesRequiredToStartCounter, you, shareAccessKeyMapByKeyholderId]);

  useEffect(() => {
    if (isTresholdReached) {
      const now = new Date();
      onStartRef.current?.(now);
    } else {
      onStopRef.current?.();
    }
  }, [isTresholdReached]);
}
