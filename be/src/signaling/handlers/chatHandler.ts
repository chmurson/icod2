import type { MessageHandler } from "../types";

// Note: ChatMessage type is not in the contracts yet, so we'll use a generic approach
export const handleChatMessage: MessageHandler = (
	data: any,
	sender,
	senderId,
	context,
) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};
