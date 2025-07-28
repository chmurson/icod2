import { type RefObject, useEffect, useMemo, useRef } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { DataChannelManager } from "@/services/webrtc";
import { useDataChannelSendMessages } from "../dataChannelSendMessage";
import { usePartOfCreateBoxStore } from "./usePartOfCreateBoxStore";

export const useKeepKeyHoldersUpdated = (
  dataChannelManagerRef: RefObject<DataChannelManager | undefined>,
) => {
  const { state } = usePartOfCreateBoxStore();

  const { sendKeyholdersUpdate, sendBoxUpdate } = useDataChannelSendMessages({
    dataChannelManagerRef,
  });

  const keyHoldersRef = useRef(state.keyHolders);
  keyHoldersRef.current = state.keyHolders;

  useEffect(() => {
    sendKeyholdersUpdate(state.keyHolders);
  }, [state.keyHolders, sendKeyholdersUpdate]);

  const updatePayload = useMemo(
    () => ({
      content: state.content,
      threshold: state.threshold,
      title: state.title,
      contentPreviewSharedWith: state.contentPreviewSharedWith,
    }),
    [
      state.content,
      state.threshold,
      state.title,
      state.contentPreviewSharedWith,
    ],
  );

  const debouncedPayload = useDebouncedValue(updatePayload, 250);

  useEffect(() => {
    const { content, contentPreviewSharedWith, threshold, title } =
      debouncedPayload;

    keyHoldersRef.current.forEach((keyHolder) => {
      const isContentShared = contentPreviewSharedWith[keyHolder.id] === true;
      sendBoxUpdate({
        id: keyHolder.id,
        title: title,
        keyHolderThreshold: threshold,
        content: isContentShared ? content : undefined,
        isContentShared,
      });
    });
  }, [debouncedPayload, sendBoxUpdate]);
};
