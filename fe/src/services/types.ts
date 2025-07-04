export type IdMessage = {
	type: "id";
	id: string;
};

export type GreetingMessage = {
	type: "greeting";
	id: string;
};

export type AcknowledgeLeaderMessage = {
	type: "acknowledgeLeader";
	leaderId: string;
	leaderName: string;
	leaderDevice: "desktop" | "mobile";
	leaderUserAgent: string;
};

export type PeerConnectedMessage = {
	type: "peerConnected";
	peerId: string;
	userAgent: string;
};

export type PeerDisconnectedMessage = {
	type: "peerDisconnected";
	peerId: string;
};

export type OfferMessage = {
	type: "offer";
	targetId: string;
	offer: RTCSessionDescriptionInit;
	senderId: string;
};

export type AnswerMessage = {
	type: "answer";
	targetId: string;
	answer: RTCSessionDescriptionInit;
	senderId: string;
};

export type CandidateMessage = {
	type: "candidate";
	targetId: string;
	candidate: RTCIceCandidateInit;
	senderId: string;
};

export type BoxStateUpdateMessage = {
	type: "boxStateUpdate";
	threshold?: number;
	title?: string;
	content?: string;
};

export type SignalingMessage =
	| IdMessage
	| GreetingMessage
	| AcknowledgeLeaderMessage
	| PeerConnectedMessage
	| PeerDisconnectedMessage
	| OfferMessage
	| AnswerMessage
	| CandidateMessage
	| BoxStateUpdateMessage;
