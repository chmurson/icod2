import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { useDownloadBoxStore } from "@/stores";
import { isKeyHolderSendsCreatedBoxReceived } from "../commons";

export const router = new DataChannelMessageRouter();

router.addHandler(isKeyHolderSendsCreatedBoxReceived, (peerId) => {
  const state = useDownloadBoxStore.getState();
  if (state.type === "fromCreateBox") {
    state.addConfirmationBoxReceived(peerId);
  }
});
