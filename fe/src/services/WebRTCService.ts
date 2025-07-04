import { useCreateBoxStore } from "../stores/boxStore/createBoxStore";
import { useJoinBoxCreationState } from "../stores/boxStore/joinBoxCreationStore";
import type {
	AcknowledgeLeaderMessage,
	BoxStateUpdateMessage,
	IdMessage,
	PeerConnectedMessage,
	PeerDisconnectedMessage,
	SignalingMessage,
} from "./types";

// in order to allow access to app in local network, yor IP instead of localhost
const SIGNALING_SERVER_URL = `ws://localhost:8080`;

type WebSocketHandlerOptions = {
	onId: (data: IdMessage) => void;
	onAcknowledgeLeader?: (data: AcknowledgeLeaderMessage) => void;
	onPeerConnected: (data: PeerConnectedMessage) => Promise<void>;
	onPeerDisconnected: (data: PeerDisconnectedMessage) => void;
	onStart: () => void;
};

class WebRTCService {
	private ws: WebSocket | null = null;
	private peerConnections: Map<string, RTCPeerConnection> = new Map();
	private dataChannels: Map<string, RTCDataChannel> = new Map();
	private myId: string | null = null;

	connectLeader() {
		const { start, connectLeader, connectParticipant, disconnectParticipant } =
			useCreateBoxStore.getState().actions;

		this.setupWebSocketHandlers({
			onStart: start,
			onId: (data) => {
				connectLeader({
					id: data.id,
					name: "Leader",
					userAgent: navigator.userAgent,
					device: "desktop",
				});
			},
			onPeerConnected: async (data) => {
				const peer = this.setupPeerConnection(data.peerId, true);
				const offer = await peer.createOffer();
				await peer.setLocalDescription(offer);
				this.ws?.send(
					JSON.stringify({ type: "offer", targetId: data.peerId, offer }),
				);
				connectParticipant({
					id: data.peerId,
					name: "John Doe",
					userAgent: data.userAgent,
					device: "desktop",
				});
			},
			onPeerDisconnected: (data) => {
				disconnectParticipant(data.peerId);
			},
		});
	}

	connectParticipant() {
		const { start, connectYou, connectParticipant, disconnectParticipant } =
			useJoinBoxCreationState.getState().actions;

		this.setupWebSocketHandlers({
			onStart: start,
			onId: () => {},
			onAcknowledgeLeader: (data) => {
				connectYou({
					you: {
						id: this.myId ?? "id-not-assigned-probably-error",
						name: "Ben Smith",
						device: "desktop",
						userAgent: navigator.userAgent,
					},
					leader: {
						id: data.leaderId,
						name: data.leaderName,
						device: data.leaderDevice,
						userAgent: data.leaderUserAgent,
					},
				});
			},
			onPeerConnected: async (data) => {
				// Participant does not initiate connection, only adds other peers to the list.
				if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
					connectParticipant({
						id: data.peerId,
						name: "John Doe",
						userAgent: data.userAgent,
						device: "desktop",
					});
				}
			},
			onPeerDisconnected: (data) => {
				disconnectParticipant(data.peerId);
			},
		});
	}

	private setupWebSocketHandlers({
		onId,
		onAcknowledgeLeader,
		onPeerConnected,
		onPeerDisconnected,
		onStart,
	}: WebSocketHandlerOptions) {
		if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
			return; // Already connected or connecting
		}

		this.ws = new WebSocket(SIGNALING_SERVER_URL);

		this.ws.onopen = () => {
			this.ws?.send(
				JSON.stringify({ type: "greeting", id: navigator.userAgent }),
			);
			onStart();
		};

		this.ws.onmessage = async (event) => {
			const data: SignalingMessage = JSON.parse(event.data);

			switch (data.type) {
				case "id":
					this.myId = data.id;
					onId(data);
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
					const { setMessage } = useJoinBoxCreationState.getState().actions;
					const { type, content, ...messageWithoutType } = message;
					setMessage(messageWithoutType);
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
}

export const webRTCService = new WebRTCService();
