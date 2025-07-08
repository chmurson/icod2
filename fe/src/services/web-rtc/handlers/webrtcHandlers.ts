import type {
	AnswerMessage,
	CandidateMessage,
	OfferMessage,
} from "@icod2/contracts";
import type { WebRTCMessageHandler } from "../types";

export const handleOffer: WebRTCMessageHandler = async (data, ctx) => {
	const { senderId, offer } = data as OfferMessage;
	let peer = ctx.peerConnections.get(senderId);
	if (!peer) {
		peer =
			ctx.signalingService?.setupPeerConnection(senderId, false) ||
			new RTCPeerConnection();
		ctx.peerConnections.set(senderId, peer);
	}
	await peer.setRemoteDescription(offer);
	const answer = await peer.createAnswer();
	await peer.setLocalDescription(answer);
	ctx.ws.send(JSON.stringify({ type: "answer", targetId: senderId, answer }));
};

export const handleAnswer: WebRTCMessageHandler = async (data, ctx) => {
	const { senderId, answer } = data as AnswerMessage;
	const peer = ctx.peerConnections.get(senderId);
	if (peer && peer.signalingState !== "stable") {
		await peer.setRemoteDescription(answer);
	}
};

export const handleCandidate: WebRTCMessageHandler = async (data, ctx) => {
	const { senderId, candidate } = data as CandidateMessage;
	const peer = ctx.peerConnections.get(senderId);
	if (peer?.remoteDescription) {
		try {
			await peer.addIceCandidate(candidate);
		} catch (e) {
			console.error("Error adding received ice candidate", e);
		}
	}
};
