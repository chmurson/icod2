import type { PeerMessageExchangeProtocol } from "@icod2/protocols";
import { PeersMessageRouter } from "@/services/libp2p";
import { useDownloadBoxStore } from "@/stores";
import { isKeyHolderSendsCreatedBoxReceived } from "../commons";

export const router = new PeersMessageRouter<
  Record<string, unknown>,
  PeerMessageExchangeProtocol
>();

router.addHandler(isKeyHolderSendsCreatedBoxReceived, (peerId) => {
  const state = useDownloadBoxStore.getState();
  if (state.type === "fromCreateBox") {
    state.addConfirmationBoxReceived(peerId);
  }
});
