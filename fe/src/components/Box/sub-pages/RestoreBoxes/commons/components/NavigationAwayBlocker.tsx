import { type FC, useCallback, useState } from "react";
import type { StoreApi, UseBoundStore } from "zustand";
import type { LockedBoxStoreCommonPart } from "@/stores/boxStore/common-types";
import {
  NavigateAwayAlert,
  useNavigateAwayBlocker,
} from "@/ui/NavigateAwayAlert";

type Props = {
  useHookStore: UseBoundStore<
    StoreApi<
      Pick<
        LockedBoxStoreCommonPart,
        | "state"
        | "unlockingStartDate"
        | "shareAccessKeyMapByKeyHolderId"
        | "key"
        | "you"
        | "keyThreshold"
      >
    >
  >;
  onGoBack?: () => void;
  isLeader?: boolean;
};

type BlockReason =
  | "box-can-be-unlocked-now"
  | "countdown-has-started"
  | "leader-is-critical";

export const NavigationAwayBlocker: FC<Props> = ({
  useHookStore,
  onGoBack,
  isLeader = false,
}) => {
  const [shouldBeBlockedReason, setShouldBeBlokedReason] = useState<
    BlockReason | undefined
  >();

  const status = useHookStore((state) => state.state);
  const unlockingStartDate = useHookStore((state) => state.unlockingStartDate);

  const shouldHaveEnoughKeysToUnlock = useHookStore((state) => {
    return (
      Object.values(state.shareAccessKeyMapByKeyHolderId).filter(
        (value) => value[state.you.id] === true,
      ).length +
        (state.key?.trim() !== "" ? 1 : 0) >=
      state.keyThreshold
    );
  });

  const shouldNavigationBeBlocked: () =>
    | { shouldBeBlocked: false }
    | { shouldBeBlocked: true; reason: BlockReason } = useCallback(() => {
    if (status === "ready-to-unlock") {
      if (!shouldHaveEnoughKeysToUnlock) {
        return {
          shouldBeBlocked: false,
        };
      }

      return {
        shouldBeBlocked: true,
        reason: "box-can-be-unlocked-now",
      };
    }

    if (unlockingStartDate !== null) {
      return {
        shouldBeBlocked: true,
        reason: "countdown-has-started",
      };
    }

    if (isLeader) {
      return {
        shouldBeBlocked: true,
        reason: "leader-is-critical",
      };
    }

    return {
      shouldBeBlocked: false,
    };
  }, [status, unlockingStartDate, shouldHaveEnoughKeysToUnlock, isLeader]);

  const blocker = useNavigateAwayBlocker({
    shouldNavigationBeBlocked: () => {
      const result = shouldNavigationBeBlocked();

      if (result.shouldBeBlocked) {
        setShouldBeBlokedReason(result.reason);
      }

      return result.shouldBeBlocked;
    },
  });

  return (
    <NavigateAwayAlert
      {...getGoBackTextByShouldBeBlockedReason(shouldBeBlockedReason)}
      open={blocker.state === "blocked"}
      onClose={() => {
        blocker.reset?.();
      }}
      onGoBack={() => {
        blocker.proceed?.();
        onGoBack?.();
      }}
    />
  );
};

function getGoBackTextByShouldBeBlockedReason(
  reason: BlockReason | undefined,
): {
  textTitle?: string;
  textDescription?: string;
} {
  if (!reason) {
    return {};
  }

  if (reason === "box-can-be-unlocked-now") {
    return {
      textTitle: "Your Box can be unlocked now",
      textDescription:
        "Are you sure you want to leave? You have the opportunity to unlock your Box right now. If you navigate away, you might miss this chance.",
    };
  }

  if (reason === "leader-is-critical") {
    return {
      textTitle: "Critical action required as Leader",
      textDescription:
        "You are the Leader of this Box and your action is critical. Leaving now could affect other participants. Are you sure you want to navigate away?",
    };
  }

  return {
    textTitle: "Countdown in progress",
    textDescription:
      "The countdown has already started. If you leave now, you might miss opportunity to participate in unlockign the box. Are you sure you want to continue?",
  };
}
