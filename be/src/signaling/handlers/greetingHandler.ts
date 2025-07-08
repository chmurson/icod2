import type { MessageHandler } from "../types";

export const handleGreeting: MessageHandler = (
	data,
	senderId,
	context,
	sender?,
) => {
	if (data.type !== "greeting") {
		throw new Error("handleGreeting called with non-greeting message");
	}

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
