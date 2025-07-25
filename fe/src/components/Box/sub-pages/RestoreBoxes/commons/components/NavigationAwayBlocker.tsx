import { type FC, useCallback } from "react";
import type { StoreApi, UseBoundStore } from "zustand";
import type { LockedBoxStoreCommonPart } from "@/stores/boxStore/common-types";
import { GoBackAlert, useGoBackAlertHook } from "@/ui/GoBackAlert";

type Props = {
  useHookStore: UseBoundStore<
    StoreApi<Pick<LockedBoxStoreCommonPart, "state" | "unlockingStartDate">>
  >;
  onGoBack?: () => void;
};

export const NavigationAwayBlocker: FC<Props> = ({
  useHookStore,
  onGoBack,
}) => {
  const status = useHookStore((state) => state.state);
  const unlockingStartDate = useHookStore((state) => state.unlockingStartDate);

  const shouldNavigationBeBlocked = useCallback(() => {
    if (status === "ready-to-unlock") {
      return true;
    }
    if (unlockingStartDate !== null) {
      return true;
    }

    return false;
  }, [status, unlockingStartDate]);

  const blocker = useGoBackAlertHook({ shouldNavigationBeBlocked });

  return (
    <GoBackAlert
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
