import { useEffect, useState } from "react";
import { Text } from "@/components/ui";
import { cn } from "@/utils/cn";

const TWO_MINUTES_IN_MS = 10 * 1000;

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const CounterWithInfo = ({
  unlockingStartDate,
  keyThreshold,
  onlineKeyHoldersCount,
  onFinish,
}: {
  unlockingStartDate: Date | null;
  keyThreshold: number;
  onlineKeyHoldersCount: number;
  onFinish: () => void;
}) => {
  const [remainingTime, setRemainingTime] = useState(TWO_MINUTES_IN_MS);

  useEffect(() => {
    if (!unlockingStartDate) {
      setRemainingTime(TWO_MINUTES_IN_MS);
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
        )}
      >
        {formatTime(remainingTime)}
      </Text>
      {remainingTime <= 10000 ? (
        <Text variant="label">
          Final call to exchange keys before unlocking
        </Text>
      ) : unlockingStartDate ? (
        <Text variant="label">Unlocking soon - last chance to share keys</Text>
      ) : (
        <Text variant="label">
          {"The timer starts when someone has "}
          <span className="text-[var(--accent-8)]">{keyThreshold}</span>
          {" of "}
          <span className="text-[var(--accent-8)]">
            {onlineKeyHoldersCount} keys
          </span>
        </Text>
      )}
    </div>
  );
};
