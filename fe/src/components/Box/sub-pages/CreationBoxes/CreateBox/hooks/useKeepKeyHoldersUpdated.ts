import type { PeerMessageExchangeProtocol } from "@icod2/protocols";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDataChannelSendMessages } from "../dataChannelSendMessage";
import { usePartOfCreateBoxStore } from "./usePartOfCreateBoxStore";

export const useKeepKeyHoldersUpdated = (
  peerMessageExchangeRef: RefObject<PeerMessageExchangeProtocol | undefined>,
) => {
  const { state } = usePartOfCreateBoxStore();

  const { sendKeyholdersUpdate, sendBoxUpdate } = useDataChannelSendMessages({
    peerProtoExchangeRef: peerMessageExchangeRef,
  });

  const keyHoldersRef = useRef(state.keyHolders);
  keyHoldersRef.current = state.keyHolders;

  useEffect(() => {
    if (state.keyHolders.length === 0) return;

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
