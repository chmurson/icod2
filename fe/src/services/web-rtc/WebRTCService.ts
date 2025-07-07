import type {
	AcknowledgeLeaderMessage,
	BoxStateUpdateMessage,
	IdMessage,
	PeerConnectedMessage,
	PeerDisconnectedMessage,
	SignalingMessage,
	ThresholdStateUpdateMessage,
} from "@icod2/contracts";

import { useDownloadBoxStore } from "@/stores";
import { useCreateBoxStore } from "../../stores/boxStore/createBoxStore";
import { useJoinBoxCreationState } from "../../stores/boxStore/joinBoxCreationStore";

// in order to allow access to app in local network, yor IP instead of localhost

type WebSocketHandlerOptions = {
	userName: string;
	onId?: (data: IdMessage) => void;
	onAcknowledgeLeader?: (data: AcknowledgeLeaderMessage) => void;
	onPeerConnected: (data: PeerConnectedMessage) => Promise<void>;
	onPeerDisconnected: (data: PeerDisconnectedMessage) => void;
	onStart?: () => void;
};

class WebRTCService {
	private ws: WebSocket | null = null;
	private peerConnections: Map<string, RTCPeerConnection> = new Map();
	private dataChannels: Map<string, RTCDataChannel> = new Map();
	private myId: string | null = null;

	connectLeader() {
		const { connectLeader, connectParticipant, disconnectParticipant } =
			useCreateBoxStore.getState().actions;

		const { leader } = useCreateBoxStore.getState();

		this.setupWebSocketHandlers({
			userName: leader.name,
			onId: (data) => {
				connectLeader({
					id: data.id,
				});
			},
			onPeerConnected: async (data) => {
				const peer = this.setupPeerConnection(data.peerId, true);
				const offer = await peer.createOffer();
				await peer.setLocalDescription(offer);
				this.ws?.send(
					JSON.stringify({ type: "offer", targetId: data.peerId, offer }),
				);
				if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
					connectParticipant({
						id: data.peerId,
						name: data.name,
						userAgent: data.userAgent,
					});
				}
			},
			onPeerDisconnected: (data) => {
				disconnectParticipant(data.peerId);
			},
		});
	}

	connectParticipant() {
		const { connectYou, connectParticipant, disconnectParticipant } =
			useJoinBoxCreationState.getState().actions;

		const { you } = useJoinBoxCreationState.getState();

		this.setupWebSocketHandlers({
			userName: you.name,
			onAcknowledgeLeader: (data) => {
				connectYou({
					you: {
						id: this.myId ?? "id-not-assigned-probably-error",
						name: you.name,
						userAgent: you.userAgent,
					},
					leader: {
						id: data.leaderId,
						name: data.leaderName,
						userAgent: data.leaderUserAgent,
					},
				});
			},
			onPeerConnected: async (data) => {
				// Participant does not initiate connection, only adds other peers to the list.
				if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
					connectParticipant({
						id: data.peerId,
						name: data.name,
						userAgent: data.userAgent,
					});
				}
			},
			onPeerDisconnected: (data) => {
				disconnectParticipant(data.peerId);
			},
		});
	}

	private setupWebSocketHandlers({
		userName,
		onId,
		onAcknowledgeLeader,
		onPeerConnected,
		onPeerDisconnected,
		onStart,
	}: WebSocketHandlerOptions) {
		if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
			return; // Already connected or connecting
		}

		this.ws = new WebSocket(import.meta.env.VITE_SIGNALING_SERVER_URL);

		this.ws.onopen = () => {
			this.ws?.send(
				JSON.stringify({
					type: "greeting",
					name: userName,
					userAgent: navigator.userAgent,
				}),
			);
			onStart?.();
		};

		this.ws.onmessage = async (event) => {
			const data: SignalingMessage = JSON.parse(event.data);

			switch (data.type) {
				case "id":
					this.myId = data.id;
					onId?.(data);
					break;
				case "acknowledgeLeader":
					onAcknowledgeLeader?.(data);
					break;
				case "peerConnected":
					await onPeerConnected(data);
					break;
				case "peerDisconnected":
					this.peerConnections.get(data.peerId)?.close();
					this.peerConnections.delete(data.peerId);
					this.dataChannels.delete(data.peerId);
					onPeerDisconnected(data);
					break;
				case "offer": {
					let peer = this.peerConnections.get(data.senderId);
					if (!peer) {
						peer = this.setupPeerConnection(data.senderId, false);
					}
					await peer.setRemoteDescription(data.offer);
					const answer = await peer.createAnswer();
					await peer.setLocalDescription(answer);
					this.ws?.send(
						JSON.stringify({ type: "answer", targetId: data.senderId, answer }),
					);
					break;
				}
				case "answer": {
					const peer = this.peerConnections.get(data.senderId);
					if (peer && peer.signalingState !== "stable") {
						await peer.setRemoteDescription(data.answer);
					}
					break;
				}
				case "candidate": {
					const peer = this.peerConnections.get(data.senderId);
					if (peer?.remoteDescription) {
						try {
							await peer.addIceCandidate(data.candidate);
						} catch (e) {
							console.error("Error adding received ice candidate", e);
						}
					}
					break;
				}
			}
		};
	}

	private setupPeerConnection(
		peerId: string,
		isInitiator: boolean,
	): RTCPeerConnection {
		const peer = new RTCPeerConnection();
		this.peerConnections.set(peerId, peer);

		peer.onicecandidate = (event) => {
			if (event.candidate && this.ws) {
				this.ws.send(
					JSON.stringify({
						type: "candidate",
						targetId: peerId,
						candidate: event.candidate,
					}),
				);
			}
		};

		const handleDataChannel = (dc: RTCDataChannel) => {
			this.dataChannels.set(peerId, dc);
			dc.onopen = () => {};
			dc.onclose = () => {};
			dc.onmessage = (ev) => {
				const message: SignalingMessage = JSON.parse(ev.data);
				if (message.type === "boxStateUpdate") {
					const { create } = useJoinBoxCreationState.getState().actions;
					const { fromJoinBox } = useDownloadBoxStore.getState();
					const { type, ...messageWithoutType } = message;
					create(messageWithoutType);
					fromJoinBox();
				}
				if (message.type === "thresholdStatUpdate") {
					const { setThreshold } = useJoinBoxCreationState.getState().actions;
					setThreshold(message.threshold);
				}
			};
		};

		if (isInitiator) {
			const dataChannel = peer.createDataChannel("chat");
			handleDataChannel(dataChannel);
		} else {
			peer.ondatachannel = (event) => {
				handleDataChannel(event.channel);
			};
		}

		return peer;
	}

	disconnect() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.close();
		}
		this.peerConnections.forEach((peer) => peer.close());
		this.peerConnections.clear();
		this.dataChannels.clear();
	}

	sendMessage(message: BoxStateUpdateMessage) {
		const { generatedKeys } = useCreateBoxStore.getState();
		let keyIndex = 1;
		this.dataChannels.forEach((channel) => {
			if (channel.readyState === "open") {
				const messageToSend = {
					...message,
					generatedKey: generatedKeys[keyIndex],
				};
				channel.send(JSON.stringify(messageToSend));
				keyIndex++;
			}
		});
	}

	sendThreshold(message: ThresholdStateUpdateMessage) {
		this.dataChannels.forEach((channel) => {
			if (channel.readyState === "open") {
				const messageToSend = {
					...message,
				};
				channel.send(JSON.stringify(messageToSend));
			}
		});
	}
}

export const webRTCService = new WebRTCService();
