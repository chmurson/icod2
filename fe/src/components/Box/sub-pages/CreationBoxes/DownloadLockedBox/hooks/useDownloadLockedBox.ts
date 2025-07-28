import { useCallback, useState } from "react";
import type {
  LockedBox,
  ParticipantType,
} from "@/stores/boxStore/common-types";
import { useDownloadLockedBoxState } from "./useDownloadLockedBoxState";

const defaultArgs = {};

export const useDownloadLockedBox = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = defaultArgs) => {
  const state = useDownloadLockedBoxState();

  const [error, setError] = useState<string | undefined>(undefined);

  const downloadLockedBox = useCallback(() => {
    const lockedBox = getLockedBox(state);

    if (!lockedBox) {
      setError("Failed to download box due to missing data");
      return;
    }

    downloadFile(JSON.stringify(lockedBox, null, 2), "locked-box.json");
    onSuccess?.();
  }, [onSuccess, state]);

  return {
    downloadLockedBox,
    error,
  };
};

function downloadFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

const getLockedBox = (
  state: ReturnType<typeof useDownloadLockedBoxState>,
): LockedBox | undefined => {
  if (
    !state.encryptedMessage ||
    !state.generatedKey ||
    !state.threshold ||
    (!state.you?.id && !state.leader)
  ) {
    return;
  }

  const isFromCreateBox = state.type === "fromCreateBox" || !state.you;
  const keyHolderId = isFromCreateBox ? state.leader.id : state.you.id;
  const keyHolders: ParticipantType[] = isFromCreateBox
    ? [state.leader, ...(state.keyHolders ?? [])]
    : [state.leader, ...(state.otherKeyHolders ?? []), state.you];
  return {
    encryptedMessage: state.encryptedMessage,
    key: state.generatedKey,
    boxTitle: state.title,
    keyHolderId,
    keyHolders,
    keyThreshold: state.threshold,
  };
};
