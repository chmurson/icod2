import type {
	AcknowledgeLeaderMessage,
	IdMessage,
	PeerConnectedMessage,
	PeerDisconnectedMessage,
	SignalingMessage,
} from "@icod2/contracts";
import type { SignalingService } from "./SignalingService";

export type WebRTCMessageHandler = (
	data: SignalingMessage,
	context: WebRTCHandlerContext,
) => Promise<void> | void;

export interface WebRTCHandlerContext {
	myId: string | null;
	ws: WebSocket;
	peerConnections: Map<string, RTCPeerConnection>;
	dataChannels: Map<string, RTCDataChannel>;
	signalingService?: SignalingService;
	onId?: (data: IdMessage) => void;
	onAcknowledgeLeader?: (data: AcknowledgeLeaderMessage) => void;
	onPeerConnected?: (data: PeerConnectedMessage) => Promise<void>;
	onPeerDisconnected?: (data: PeerDisconnectedMessage) => void;
}
