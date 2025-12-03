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
  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const onStartRef = useRef<(startDate: Date) => void>(undefined);
  const onStopRef = useRef<() => void>(undefined);
  onStartRef.current = onStart;
  onStopRef.current = onStop;

  const sharesRequiredToStartCounter = keyThreshold - 1;

  const isTresholdReached = useMemo(() => {
    const numberOfSharesByKeyHolderId = Object.values(
      shareAccessKeyMapByKeyHolderId,
    ).reduce(
      (prev, accesses) => {
        Object.entries(accesses).forEach(([key, hasShare]) => {
          if (hasShare === true) {
            prev[key] = (prev[key] ?? 0) + 1;
          }
        });

        return prev;
      },
      {} as Record<string, number>,
    );

    return Object.values(numberOfSharesByKeyHolderId).some(
      (sharesNumber) => sharesNumber >= sharesRequiredToStartCounter,
    );
  }, [sharesRequiredToStartCounter, shareAccessKeyMapByKeyHolderId]);

  console.log("------");
  console.log("isTresholdReached", isTresholdReached);
  console.log("sharesRequiredToStartCounter", sharesRequiredToStartCounter);
  console.log("shareAccessKeyMapByKeyHolderId", shareAccessKeyMapByKeyHolderId);

  const prevIsTresholdReached = usePrevious(isTresholdReached);

  useEffect(() => {
    if (prevIsTresholdReached !== true && isTresholdReached) {
      const now = new Date();
      onStartRef.current?.(now);
    } else if (prevIsTresholdReached === true && isTresholdReached === false) {
      onStopRef.current?.();
    }
  }, [isTresholdReached, prevIsTresholdReached]);
}

function usePrevious<T>(
  value: T,
  initialValue: T | undefined = undefined,
): T | undefined {
  const ref = useRef<T>(initialValue);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
