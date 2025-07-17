import { useCallback, useState } from "react";
import type {
  LockedBoxFile,
  ParticipantType,
} from "@/stores/boxStore/common-types";
import { useBoxDownloadState } from "./useBoxDownloadState";

const defaultArgs = {};

export const useDownloadShard = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = defaultArgs) => {
  const state = useBoxDownloadState();

  const [error, setError] = useState<string | undefined>(undefined);

  const downloadKeyShardAndMessage = useCallback(() => {
    const data = getLockedBoxFileData(state, setError);
    downloadFile(JSON.stringify(data, null, 2), "locked-box.json");
    onSuccess?.();
  }, [onSuccess, state]);

  return {
    downloadKeyShardAndMessage,
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

const getLockedBoxFileData = (
  state: ReturnType<typeof useBoxDownloadState>,
  setError: (msg: React.SetStateAction<string | undefined>) => void,
): LockedBoxFile | undefined => {
  if (
    !state.encryptedMessage ||
    !state.generatedKey ||
    !state.threshold ||
    (!state.you?.id && !state.leader)
  ) {
    setError("Failed to download box due to missing data");
    return;
  }

  let keyHolderId: string;
  const keyHolders: ParticipantType[] = [];
  if (state.type !== "fromCreateBox" && state.you) {
    keyHolderId = state.you.id;
    keyHolders.push(
      ...[state.leader, ...(state.otherKeyHolders ?? []), state.you],
    );
  } else {
    keyHolderId = state.leader.id;
    keyHolders.push(...[state.leader, ...(state.keyHolders ?? [])]);
  }
  return {
    encryptedMessage: state.encryptedMessage,
    key: state.generatedKey,
    boxTitle: state.title,
    keyHolderId,
    keyHolders,
    keyThreshold: state.threshold,
  };
};
