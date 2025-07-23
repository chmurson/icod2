import { useEffect, useState } from "react";
import { Text } from "@/components/ui";

const TWO_MINUTES_IN_MS = 2 * 60 * 1000;

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
}: {
  unlockingStartDate: Date | null;
  keyThreshold: number;
  onlineKeyHoldersCount: number;
}) => {
  const [remainingTime, setRemainingTime] = useState(TWO_MINUTES_IN_MS);

  useEffect(() => {
    if (!unlockingStartDate) {
      setRemainingTime(TWO_MINUTES_IN_MS);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = unlockingStartDate.getTime();
      const diff = now - startTime;
      const remaining = TWO_MINUTES_IN_MS - diff;

      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockingStartDate]);

  return (
    <div className="flex flex-col items-center gap-1">
      <Text
        variant="pageTitle"
        className={`text-7xl ${remainingTime <= 10000 ? "text-red-400" : ""}`}
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
          <span className="text-purple-500">{keyThreshold}</span>
          {" of "}
          <span className="text-purple-500">{onlineKeyHoldersCount} keys</span>
        </Text>
      )}
    </div>
  );
};
