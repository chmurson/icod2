import { useEffect, useMemo } from "react";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import type { FollowerSendsPartialStateMessage } from "../commons";

export const useOnChangeShareablePartOfState = ({
  onChange,
}: {
  onChange: (arg: Omit<FollowerSendsPartialStateMessage, "type">) => void;
}) => {
  const shareAccessKeyByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );

  const keyHoldersIdsToSharedKeyWith = useMemo(() => {
    return Object.entries(shareAccessKeyByKeyHolderId)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  }, [shareAccessKeyByKeyHolderId]);

  useEffect(() => {
    if (!onChange) {
      return;
    }

    onChange({
      keyHoldersIdsToSharedKeyWith,
    });
  }, [keyHoldersIdsToSharedKeyWith, onChange]);
};
