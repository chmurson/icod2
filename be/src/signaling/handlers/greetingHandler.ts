import type { GreetingMessage } from "@icod2/contracts";
import type { MessageHandler } from "../types";

export const handleGreeting: MessageHandler = (
	data: GreetingMessage,
	senderId,
	context,
	sender?,
) => {
	context.clients.updateClient(senderId, {
		userAgent: data.userAgent,
		id: data.id,
		name: data.name,
	});

	if (!context.leaderName && !context.leaderUserAgent) {
		context.updateLeaderInfo?.(data.name, data.userAgent);
	}

	const peerConnectedMessage = {
		type: "peerConnected",
		peerId: senderId,
		name: data.name,
		userAgent: data.userAgent,
	};

	context.clients.broadcastToOthers(
		senderId,
		JSON.stringify(peerConnectedMessage),
	);

	const allClients = context.clients.getAllClients();
	for (const [clientId, clientInfo] of allClients.entries()) {
		if (clientId !== senderId && clientInfo.name && clientInfo.userAgent) {
			const existingPeerMessage = {
				type: "peerConnected",
				peerId: clientId,
				name: clientInfo.name,
				userAgent: clientInfo.userAgent,
			};
			sender?.ws.send(JSON.stringify(existingPeerMessage));
		}
	}
};
