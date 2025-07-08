import { createServer, type Server } from "node:http";
import type {
	AcknowledgeLeaderMessage,
	IdMessage,
	PeerDisconnectedMessage,
	SignalingMessage,
} from "@icod2/contracts";
import { v4 as uuidv4 } from "uuid";
import { type WebSocket, WebSocketServer } from "ws";
import { ClientManager } from "./ClientManager";
import { MessageRouter } from "./MessageRouter";
import type { HandlerContext } from "./types";

export class SignalingServer {
	private server: Server;
	private wss: WebSocketServer;
	private clientManager: ClientManager;
	private messageRouter: MessageRouter;
	private leaderId?: string;
	private leaderName?: string;
	private leaderUserAgent?: string;

	constructor(port: number, hostname: string) {
		this.server = createServer();
		this.wss = new WebSocketServer({ server: this.server });
		this.clientManager = new ClientManager();
		this.messageRouter = new MessageRouter();

		this.setupWebSocketHandlers();
		this.start(port, hostname);
	}

	private setupWebSocketHandlers(): void {
		this.wss.on("connection", (ws: WebSocket) => {
			const clientId = uuidv4();

			// Send client ID
			const idMessage: IdMessage = { type: "id", id: clientId };
			ws.send(JSON.stringify(idMessage));

			// Send leader info if exists
			if (this.leaderId) {
				const leaderMessage: AcknowledgeLeaderMessage = {
					type: "acknowledgeLeader",
					leaderId: this.leaderId,
					leaderName: this.leaderName || "",
					leaderUserAgent: this.leaderUserAgent || "",
				};
				ws.send(JSON.stringify(leaderMessage));
			}

			// Set as leader if first client
			if (this.clientManager.isEmpty()) {
				this.leaderId = clientId;
			}

			// Add client to manager
			this.clientManager.addClient(clientId, ws);
			console.log(
				"[WS] New client connected. Total clients:",
				this.clientManager.getClientCount(),
			);

			// Setup message handler
			ws.on("message", (message) => this.handleMessage(message, ws));

			// Setup close handler
			ws.on("close", () => this.handleClientDisconnect(ws));

			// Setup error handler
			ws.on("error", (err) => {
				console.error("[WS] WebSocket client error:", err);
			});
		});
	}

	private handleMessage(message: unknown, ws: WebSocket): void {
		let messageText: string;
		if (typeof message === "string") {
			messageText = message;
		} else if (message instanceof Buffer) {
			messageText = message.toString();
		} else {
			console.warn("[WS] Unknown message data type:", message);
			return;
		}

		let data: SignalingMessage;
		try {
			data = JSON.parse(messageText);
		} catch {
			console.warn("[WS] Invalid JSON:", messageText);
			return;
		}

		if (!data) {
			console.warn("[WS] No data in message:", messageText);
			return;
		}

		console.log("[WS] Relaying message of type", data.type);

		const currentClientInfo = this.clientManager.findClientByWebSocket(ws);
		if (!currentClientInfo) {
			console.warn("[WS] Message from unknown client.");
			return;
		}
		const [senderId, senderInfo] = currentClientInfo;

		const context: HandlerContext = {
			clients: this.clientManager,
			wss: this.wss,
			leaderId: this.leaderId,
			leaderName: this.leaderName,
			leaderUserAgent: this.leaderUserAgent,
			updateLeaderInfo: (name: string, userAgent: string) => {
				this.leaderName = name;
				this.leaderUserAgent = userAgent;
			},
		};

		this.messageRouter.routeMessage(data, senderInfo, senderId, context);
	}

	private handleClientDisconnect(ws: WebSocket): void {
		const currentClientInfo = this.clientManager.findClientByWebSocket(ws);
		if (currentClientInfo) {
			const [disconnectedClientId] = currentClientInfo;
			this.clientManager.removeClient(disconnectedClientId);

			console.log(
				`[WS] Client ${disconnectedClientId} disconnected. Total clients:`,
				this.clientManager.getClientCount(),
			);

			// Notify other clients about the disconnection
			const disconnectMessage: PeerDisconnectedMessage = {
				type: "peerDisconnected",
				peerId: disconnectedClientId,
			};

			this.clientManager.broadcastToOthers(
				disconnectedClientId,
				JSON.stringify(disconnectMessage),
			);

			if (this.leaderId === disconnectedClientId) {
				this.leaderId = undefined;
				this.leaderName = undefined;
				this.leaderUserAgent = undefined;
			}
		} else {
			console.log(
				"[WS] Unknown client disconnected. Total clients:",
				this.clientManager.getClientCount(),
			);
		}
	}

	private start(port: number, hostname: string): void {
		this.server.listen({ port, hostname }, () => {
			console.log(`Signaling Server listens on: ws://${hostname}:${port}`);
		});
	}
}
