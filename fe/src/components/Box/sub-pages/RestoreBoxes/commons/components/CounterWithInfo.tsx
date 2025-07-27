import { type ReactNode, useEffect, useState } from "react";
import { Text } from "@/components/ui";
import { cn } from "@/utils/cn";

const localStorageCountdownOverride = Number.parseInt(
  window.localStorage.getItem("ICOD2_COUNTDOWN_OVERRIDE_IN_MS") ?? "",
);
const devOverload =
  !Number.isNaN(localStorageCountdownOverride) &&
  localStorageCountdownOverride > 1000
    ? localStorageCountdownOverride
    : undefined;

console.log("devOverload", devOverload);

const TWO_MINUTES_IN_MS = !devOverload ? 2 * 60 * 1000 : devOverload;

const formatTime = (ms: number) => {
  const clampedMs = Math.max(0, ms);
  const minutes = Math.floor(clampedMs / 60000);
  const seconds = Math.floor((clampedMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const CounterWithInfo = ({
  unlockingStartDate,
  keyThreshold,
  onlineKeyHoldersCount,
  onFinish,
  timeClassName,
  textReplacement,
}: {
  unlockingStartDate: Date | null;
  keyThreshold: number;
  onlineKeyHoldersCount: number;
  onFinish: () => void;
  timeClassName?: string;
  textReplacement?: ReactNode;
}) => {
  const [remainingTime, setRemainingTime] = useState(TWO_MINUTES_IN_MS);

  useEffect(() => {
    if (!unlockingStartDate) {
      return;
    }

    function calculateRemainingTime() {
      const now = Date.now();
      const startTime = unlockingStartDate?.getTime() ?? now;
      const diff = now - startTime;
      return TWO_MINUTES_IN_MS - diff;
    }

    setRemainingTime(calculateRemainingTime());

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime();
      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
        onFinish();
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockingStartDate, onFinish]);

  return (
    <div className="flex flex-col items-center gap-1">
      <Text
        variant="pageTitle"
        className={cn(
          "text-7xl",
          remainingTime <= 10000 && "text-red-400",
          unlockingStartDate === null && "text-gray-300 dark:text-gray-600",
          timeClassName,
        )}
      >
        {formatTime(remainingTime)}
      </Text>
      {textReplacement}
      {!textReplacement && (
        <Text variant="label">
          {remainingTime <= 10000 ? (
            "Final call to exchange keys before unlocking"
          ) : unlockingStartDate ? (
            "Unlocking soon - last chance to share keys"
          ) : (
            <>
              {"The timer starts when someone has "}
              <span className="text-[var(--accent-8)]">{keyThreshold}</span>
              {" of "}
              <span className="text-[var(--accent-8)]">
                {onlineKeyHoldersCount} keys
              </span>
            </>
          )}
        </Text>
      )}
    </div>
  );
};
