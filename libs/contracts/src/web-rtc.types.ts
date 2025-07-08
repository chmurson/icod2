export type IdMessage = {
	type: "id";
	id: string;
};

export type GreetingMessage = {
	type: "greeting";
	id: string;
	name: string;
	userAgent: string;
};

export type AcknowledgeLeaderMessage = {
	type: "acknowledgeLeader";
	leaderId: string;
	leaderName: string;
	leaderUserAgent: string;
};

export type PeerConnectedMessage = {
	type: "peerConnected";
	peerId: string;
	name: string;
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
	title?: string;
	content?: string;
	encryptedMessage?: string;
	generatedKey?: string;
};

export type ThresholdStateUpdateMessage = {
	type: "thresholdStatUpdate";
	threshold: number;
};

export type MinimalChatMessage = {
	type: "chatMessage";
	targetId: string;
	[key: string]: unknown;
};

export type TargetedSignalingMessage =
	| OfferMessage
	| AnswerMessage
	| CandidateMessage
	| MinimalChatMessage;

export type SignalingMessage =
	| IdMessage
	| GreetingMessage
	| AcknowledgeLeaderMessage
	| PeerConnectedMessage
	| PeerDisconnectedMessage
	| OfferMessage
	| AnswerMessage
	| CandidateMessage
	| BoxStateUpdateMessage
	| ThresholdStateUpdateMessage;
