import { createServer } from "node:http";
import { v4 as uuidv4 } from "uuid";
import { WebSocket, WebSocketServer } from "ws";

interface ClientInfo {
	ws: WebSocket;
	id: string;
	userAgent?: string;
	device?: string;
	name?: string;
}

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map<string, ClientInfo>();
let leaderId: string;
let leaderName: string;
let leaderUserAgent: string;

wss.on("connection", (ws) => {
	const clientId = uuidv4();

	ws.send(JSON.stringify({ type: "id", id: clientId }));

	if (leaderId) {
		console.log("ackLeade", {
			type: "acknowledgeLeader",
			leaderId,
			leaderName,
			leaderUserAgent,
		});
		ws.send(
			JSON.stringify({
				type: "acknowledgeLeader",
				leaderId,
				leaderName,
				leaderUserAgent,
			}),
		);
	}

	if (clients.size === 0) {
		leaderId = clientId;
	}

	clients.set(clientId, { ws, id: "" }); // Initialize with empty id
	console.log("[WS] New client connected. Total clients:", clients.size);

	ws.on("message", (message) => {
		let messageText: string;
		if (typeof message === "string") {
			messageText = message;
		} else if (message instanceof Buffer) {
			messageText = message.toString();
		} else {
			console.warn("[WS] Unknown message data type:", message);
			return;
		}

		let data:
			| {
					type: string;
					id: string;
					targetId: string;
					name: string;
					userAgent: string;
			  }
			| undefined;

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

		const currentClientInfo = Array.from(clients.entries()).find(
			([_id, clientInfo]) => clientInfo.ws === ws,
		);
		if (!currentClientInfo) {
			console.warn("[WS] Message from unknown client.");
			return;
		}
		const [senderId, senderInfo] = currentClientInfo;

		if (data.type === "greeting") {
			console.log("data", data);
			senderInfo.userAgent = data.userAgent;
			senderInfo.id = data.id;
			senderInfo.name = data.name;

			if (!leaderName && !leaderUserAgent) {
				leaderName = senderInfo.name ?? "";
				leaderUserAgent = senderInfo.userAgent ?? "";
			}

			// Notify all other clients about the new client
			for (const [clientId, clientInfo] of clients.entries()) {
				if (
					clientId !== senderId &&
					clientInfo.ws.readyState === WebSocket.OPEN
				) {
					console.log(
						"notifying clients about new client, peerId is",
						senderId,
					);
					console.log("peer connected");
					clientInfo.ws.send(
						JSON.stringify({
							type: "peerConnected",
							peerId: senderId,
							name: senderInfo.name,
							userAgent: senderInfo.userAgent,
						}),
					);
				}
			}

			// Notify the new client about all existing clients
			for (const [clientId, clientInfo] of clients.entries()) {
				console.log("clientInfo.id", clientInfo.id);
				if (
					clientId !== senderId &&
					clientInfo.ws.readyState === WebSocket.OPEN
				) {
					console.log("notifying new client about clients", clientId);
					ws.send(
						JSON.stringify({
							type: "peerConnected",
							peerId: clientId,
							name: clientInfo.name,
							userAgent: clientInfo.userAgent,
						}),
					);
				}
			}
		} else if (
			data.type === "offer" ||
			data.type === "answer" ||
			data.type === "candidate" ||
			data.type === "chatMessage"
		) {
			const targetClientInfo = clients.get(data.targetId);
			if (
				targetClientInfo &&
				targetClientInfo.ws.readyState === WebSocket.OPEN
			) {
				// Add senderId to the message before relaying
				const messageToRelay = { ...data, senderId: senderId };
				targetClientInfo.ws.send(JSON.stringify(messageToRelay));
			} else {
				console.warn(
					`[WS] Target client ${data.targetId} not found or not open.`,
				);
			}
		} else {
			console.warn("[WS] Unknown message type:", data.type);
		}
	});

	ws.on("close", () => {
		let disconnectedClientId: string | undefined;
		for (const [clientId, clientInfo] of clients.entries()) {
			if (clientInfo.ws === ws) {
				disconnectedClientId = clientId;
				clients.delete(clientId);
				break;
			}
		}
		if (disconnectedClientId) {
			console.log(
				`[WS] Client ${disconnectedClientId} disconnected. Total clients:`,
				clients.size,
			);
			// Notify other clients about the disconnection
			for (const [_clientId, clientInfo] of clients.entries()) {
				if (clientInfo.ws.readyState === WebSocket.OPEN) {
					clientInfo.ws.send(
						JSON.stringify({
							type: "peerDisconnected",
							peerId: disconnectedClientId,
						}),
					);
				}
			}
		} else {
			console.log(
				"[WS] Unknown client disconnected. Total clients:",
				clients.size,
			);
		}
	});

	ws.on("error", (err) => {
		console.error("[WS] WebSocket client error:", err);
	});
});

const PORT = process.env.PORT || 8080;
// in order to allow access to app in local network, put ({ port: PORT, hostname: {yourIP} } instead of (PORT
server.listen({ port: PORT, hostname: "192.168.0.74" }, () => {
	console.log(`[WS] WebSocket signaling server running on port ${PORT}`);
});
