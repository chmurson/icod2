import type { MessageHandler } from "../types";

export const handleOffer: MessageHandler = (data, senderId, context) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleAnswer: MessageHandler = (data, senderId, context) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleCandidate: MessageHandler = (data, senderId, context) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};
