import type { SignalingMessage } from "@icod2/contracts";
import { handleChatMessage } from "./handlers/chatHandler";
import { handleGreeting } from "./handlers/greetingHandler";
import {
	handleAnswer,
	handleCandidate,
	handleOffer,
} from "./handlers/webrtcHandler";
import type {
	HandlerContext,
	MessageHandler,
	MessageHandlerRegistry,
} from "./types";

export class MessageRouter {
	private handlers: MessageHandlerRegistry;

	constructor() {
		this.handlers = {
			greeting: handleGreeting,
			offer: handleOffer,
			answer: handleAnswer,
			candidate: handleCandidate,
			chatMessage: handleChatMessage,
		};
	}

	routeMessage(
		data: SignalingMessage,
		sender: any,
		senderId: string,
		context: HandlerContext,
	): void {
		const handler = this.handlers[data.type];
		if (handler) {
			handler(data, sender, senderId, context);
		} else {
			console.warn("[WS] Unknown message type:", data.type);
		}
	}

	registerHandler(messageType: string, handler: MessageHandler): void {
		this.handlers[messageType] = handler;
	}
}
