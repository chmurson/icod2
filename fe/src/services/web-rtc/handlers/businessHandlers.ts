import type { BoxInfoMessage, CreateBoxMessage } from "@icod2/contracts";
import { useDownloadBoxStore } from "@/stores";
import { useJoinBoxStore } from "@/stores/boxStore/joinBoxStore";
import type { WebRTCMessageHandler } from "../types";

export const handleCreateBox: WebRTCMessageHandler = (data, _ctx) => {
  const { create } = useJoinBoxStore.getState().actions;
  const { fromJoinBox } = useDownloadBoxStore.getState();
  const { type, ...messageWithoutType } = data as CreateBoxMessage;
  create(messageWithoutType);
  fromJoinBox();
};

export const handleBoxInfo: WebRTCMessageHandler = (data, _ctx) => {
  const { setInfoBox } = useJoinBoxStore.getState().actions;
  const { threshold, content, title } = data as BoxInfoMessage;
  setInfoBox(threshold, content, title);
};
