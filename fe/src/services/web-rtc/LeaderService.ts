import type { BoxInfoMessage, CreateBoxMessage } from "@icod2/contracts";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import type { SignalingService } from "./SignalingService";

export class LeaderService {
  public signaling: SignalingService;

  constructor(signaling: SignalingService) {
    this.signaling = signaling;
  }

  connect(options: Parameters<SignalingService["connect"]>[0]) {
    this.signaling.connect(options);
  }

  createBox(message: CreateBoxMessage) {
    const { generatedKeys } = useCreateBoxStore.getState();
    let keyIndex = 1;
    this.signaling.getDataChannels().forEach((channel) => {
      if (channel.readyState === "open") {
        const messageToSend = {
          ...message,
          generatedKey: generatedKeys[keyIndex],
        };
        channel.send(JSON.stringify(messageToSend));
        keyIndex++;
      }
    });
  }

  sendBoxInfo(
    message: BoxInfoMessage,
    isContentSharedMap: Record<string, boolean>,
  ) {
    const dataChannels = this.signaling.getDataChannels();
    for (const [peerId, channel] of dataChannels.entries()) {
      if (channel.readyState === "open") {
        const shouldShareContent = !!isContentSharedMap[peerId];
        const msgToSend = {
          ...message,
          content: shouldShareContent ? message.content : "",
        };
        channel.send(JSON.stringify(msgToSend));
      }
    }
  }

  disconnect() {
    this.signaling.disconnect();
  }
}
