import { useEffect } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type { LeaderSendsPartialStateMessage } from "../commons";

export const useOnChangeShareablePartOfState = ({
  onChange,
}: {
  onChange: (arg: Omit<LeaderSendsPartialStateMessage, "type">) => void;
}) => {
  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );
  const onlineKeyHolders = useOpenLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );
  const you = useOpenLockedBoxStore((state) => state.you);
  const unlockingStartDate = useOpenLockedBoxStore(
    (state) => state.unlockingStartDate,
  );

  useEffect(() => {
    if (!onChange) {
      return;
    }

    onChange({
      shareAccessKeyMapByKeyHolderId: shareAccessKeyMapByKeyHolderId,
      onlineKeyHolders: [...onlineKeyHolders, you],
      unlockingStartDate: unlockingStartDate?.toISOString() ?? null,
    });
  }, [
    shareAccessKeyMapByKeyHolderId,
    onlineKeyHolders,
    onChange,
    you,
    unlockingStartDate,
  ]);
};
