import type { MessageHandler } from "../types";

export const handleOffer: MessageHandler = (data, senderId, context) => {
	if (data.type !== "offer") {
		throw new Error("handleOffer called with non-offer message");
	}
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleAnswer: MessageHandler = (data, senderId, context) => {
	if (data.type !== "answer") {
		throw new Error("handleAnswer called with non-answer message");
	}
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleCandidate: MessageHandler = (data, senderId, context) => {
	if (data.type !== "candidate") {
		throw new Error("handleCandidate called with non-candidate message");
	}
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};
