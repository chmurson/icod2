import { useCallback, useState } from "react";
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
    setError(undefined);

    const data = {
      encryptedMessage: state.encryptedMessage,
      key: state.generatedKey,
      boxTitle: state.title,
      keyHolderId:
        state.type === "fromCreateBox" ? state.leader.id : state.you?.id,
      keyThreshold: state.threshold,
      keyHolders:
        state.type === "fromCreateBox"
          ? [state.leader, ...(state.keyHolders ?? [])]
          : [state.leader, ...(state.otherKeyHolders ?? []), state.you],
    };

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
