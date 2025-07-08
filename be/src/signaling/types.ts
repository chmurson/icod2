import type { SignalingMessage } from "@icod2/contracts";
import type { WebSocket, WebSocketServer } from "ws";
import type { ClientManager } from "./ClientManager";

export interface ClientInfo {
	ws: WebSocket;
	id: string;
	userAgent?: string;
	device?: string;
	name?: string;
}

export interface HandlerContext {
	clients: ClientManager;
	wss: WebSocketServer;
	leaderId?: string;
	leaderName?: string;
	leaderUserAgent?: string;
	updateLeaderInfo?: (name: string, userAgent: string) => void;
}

export type MessageHandler = (
	data: SignalingMessage,
	senderId: string,
	context: HandlerContext,
	sender?: ClientInfo,
) => void;

export type MessageHandlerRegistry = Record<string, MessageHandler>;
