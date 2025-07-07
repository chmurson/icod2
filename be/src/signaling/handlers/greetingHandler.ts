import type { GreetingMessage, PeerConnectedMessage } from "@icod2/contracts";
import { HandlerContext, type MessageHandler } from "../types";

export const handleGreeting: MessageHandler = (
	data: GreetingMessage,
	sender,
	senderId,
	context,
) => {
	// Update sender info
	context.clients.updateClient(senderId, {
		userAgent: data.userAgent,
		id: data.id,
		name: data.name,
	});

	// Set leader info if this is the first client
	if (!context.leaderName && !context.leaderUserAgent) {
		context.updateLeaderInfo?.(data.name, data.userAgent);
	}

	// Notify all other clients about the new client
	const peerConnectedMessage: PeerConnectedMessage = {
		type: "peerConnected",
		peerId: senderId,
		name: data.name,
		userAgent: data.userAgent,
	};

	context.clients.broadcastToOthers(
		senderId,
		JSON.stringify(peerConnectedMessage),
	);

	// Notify the new client about all existing clients
	const allClients = context.clients.getAllClients();
	for (const [clientId, clientInfo] of allClients.entries()) {
		if (clientId !== senderId && clientInfo.name && clientInfo.userAgent) {
			const existingPeerMessage: PeerConnectedMessage = {
				type: "peerConnected",
				peerId: clientId,
				name: clientInfo.name,
				userAgent: clientInfo.userAgent,
			};
			sender.ws.send(JSON.stringify(existingPeerMessage));
		}
	}
};
