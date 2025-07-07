import type {
	AnswerMessage,
	CandidateMessage,
	OfferMessage,
} from "@icod2/contracts";
import type { MessageHandler } from "../types";

export const handleOffer: MessageHandler = (
	data: OfferMessage,
	sender,
	senderId,
	context,
) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleAnswer: MessageHandler = (
	data: AnswerMessage,
	sender,
	senderId,
	context,
) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};

export const handleCandidate: MessageHandler = (
	data: CandidateMessage,
	sender,
	senderId,
	context,
) => {
	const messageToRelay = { ...data, senderId };
	context.clients.sendToClient(data.targetId, JSON.stringify(messageToRelay));
};
