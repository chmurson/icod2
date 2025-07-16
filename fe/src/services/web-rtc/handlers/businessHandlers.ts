import type { BoxInfoMessage, CreateBoxMessage } from "@icod2/contracts";
import { useDownloadBoxStore } from "@/stores";
import { useJoinBoxCreationState } from "@/stores/boxStore/joinBoxCreationStore";
import type { WebRTCMessageHandler } from "../types";

export const handleCreateBox: WebRTCMessageHandler = (data, _ctx) => {
  const { create } = useJoinBoxCreationState.getState().actions;
  const { fromJoinBox } = useDownloadBoxStore.getState();
  const { type, ...messageWithoutType } = data as CreateBoxMessage;
  create(messageWithoutType);
  fromJoinBox();
};

export const handleBoxInfo: WebRTCMessageHandler = (data, _ctx) => {
  const { setInfoBox } = useJoinBoxCreationState.getState().actions;
  const { threshold, content, title } = data as BoxInfoMessage;
  setInfoBox(threshold, content, title);
};
