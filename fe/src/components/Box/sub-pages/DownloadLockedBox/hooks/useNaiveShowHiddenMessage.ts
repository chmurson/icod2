import { useCallback, useState } from "react";
import { useDownloadLockedBoxState } from "./useDownloadLockedBoxState";

export const useNaiveShowHiddenMessage = () => {
  const { content } = useDownloadLockedBoxState();
  const [visibleMessage, setVisisableMessage] = useState("");

  const hideMessage = useCallback(() => {
    setVisisableMessage("");
  }, []);

  const showMessage = useCallback(() => {
    setVisisableMessage(content ?? "");
  }, [content]);

  return {
    visibleMessage,
    hideMessage,
    showMessage,
  };
};
