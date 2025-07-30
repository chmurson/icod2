import { type ReactNode, useEffect, useState } from "react";
import { Text } from "@/components/ui";
import { cn } from "@/utils/cn";

const TWO_MINUTES_IN_MS = 2 * 60 * 1000;

function getCountDownDuration() {
  const countDownOverride = window.icod2Dev.countDownOverride.get();
  if (countDownOverride) {
    return countDownOverride;
  }
  return TWO_MINUTES_IN_MS;
}

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
  hideText,
}: {
  unlockingStartDate: Date | null;
  keyThreshold: number;
  onlineKeyHoldersCount: number;
  onFinish: () => void;
  timeClassName?: string;
  textReplacement?: ReactNode;
  hideText?: boolean;
}) => {
  const [remainingTime, setRemainingTime] = useState(getCountDownDuration());

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
        <Text variant="label" className={hideText ? "invisible" : ""}>
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
