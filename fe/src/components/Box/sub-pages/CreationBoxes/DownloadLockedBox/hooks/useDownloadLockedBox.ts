import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LockedBox,
  ParticipantType,
} from "@/stores/boxStore/common-types";
import { toSafeFilename } from "@/utils/toSafeFilename";
import { truncateString } from "@/utils/truncateString";
import { useDownloadLockedBoxState } from "./useDownloadLockedBoxState";

const defaultArgs = {};

export const useDownloadLockedBox = ({
  onSuccess,
  onPrepared,
}: {
  onSuccess?: () => void;
  onPrepared?: () => void;
} = defaultArgs) => {
  const jsonToDownloadRef = useRef<string>(undefined);

  const state = useDownloadLockedBoxState();
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (jsonToDownloadRef.current) {
      return;
    }

    const lockedBox = getLockedBox(state);

    if (!lockedBox) {
      setError("Failed to download box due to missing data");
      return;
    }
    jsonToDownloadRef.current = JSON.stringify(lockedBox, null, 2);
    onPrepared?.();
  }, [state, onPrepared]);

  const downloadLockedBox = useCallback(() => {
    if (error !== undefined) {
      return;
    }

    if (!jsonToDownloadRef.current) {
      setError("The file is not yet ready for download");
      return;
    }

    const filename = `${toSafeFilename(
      [state?.title, state.you?.name ?? state.leader?.name, "locked-box"]
        .filter((x) => typeof x === "string" && x.trim().length > 0)
        .map((str) => truncateString(str, 12))
        .join("_"),
    )}.json`;

    downloadFile(jsonToDownloadRef.current, filename);
    onSuccess?.();
  }, [error, onSuccess, state]);

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
