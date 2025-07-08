import type {
	CreateBoxMessage,
	ThresholdStateUpdateMessage,
} from "@icod2/contracts";
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

	sendThreshold(message: ThresholdStateUpdateMessage) {
		this.signaling.getDataChannels().forEach((channel) => {
			if (channel.readyState === "open") {
				channel.send(JSON.stringify(message));
			}
		});
	}

	disconnect() {
		this.signaling.disconnect();
	}
}
