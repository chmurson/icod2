import type { SignalingService } from "./SignalingService";

export class ParticipantService {
	public signaling: SignalingService;

	constructor(signaling: SignalingService) {
		this.signaling = signaling;
	}

	connect(options: Parameters<SignalingService["connect"]>[0]) {
		this.signaling.connect(options);
	}

	disconnect() {
		this.signaling.disconnect();
	}
}
