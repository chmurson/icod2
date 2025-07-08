import type { MessageHandler } from "../types";

export const handleChatMessage: MessageHandler = (data, senderId, context) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};
