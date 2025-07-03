import { useCreateBoxStore } from "../stores/boxStore/createBoxStore";
import { useJoinBoxCreationState } from "../stores/boxStore/joinBoxCreationStore";

const SIGNALING_SERVER_URL = "ws://localhost:8080";

class WebRTCService {
	private ws: WebSocket | null = null;
	private peerConnections: Map<string, RTCPeerConnection> = new Map();
	private dataChannels: Map<string, RTCDataChannel> = new Map();
	private myId: string | null = null;

	connect(role: "leader" | "participant") {
		if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
			return; // Already connected or connecting
		}

		if (role === "leader") {
			const {
				start,
				connectLeader,
				connectParticipant,
				disconnectParticipant,
			} = useCreateBoxStore.getState().actions;
			this.ws = new WebSocket(SIGNALING_SERVER_URL);

			this.ws.onopen = () => {
				this.ws?.send(
					JSON.stringify({ type: "greeting", id: navigator.userAgent }),
				);
				start();
			};

			this.ws.onmessage = async (event) => {
				const data = JSON.parse(event.data);

				if (data.type === "id") {
					this.myId = data.id;
					connectLeader({
						id: data.id,
						name: "Leader",
						userAgent: navigator.userAgent,
						device: "desktop",
					});
				} else if (data.type === "peerConnected") {
					console.log("peerConnected!!!!!!!!!!!");
					// if (this.myId && this.myId < data.peerId) {
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
					// }
				} else if (data.type === "peerDisconnected") {
					this.peerConnections.get(data.peerId)?.close();
					this.peerConnections.delete(data.peerId);
					this.dataChannels.delete(data.peerId);
					disconnectParticipant(data.peerId);
				} else if (data.type === "offer") {
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
				} else if (data.type === "answer") {
					const peer = this.peerConnections.get(data.senderId);
					if (peer && peer.signalingState !== "stable") {
						await peer.setRemoteDescription(data.answer);
					}
				} else if (data.type === "candidate") {
					const peer = this.peerConnections.get(data.senderId);
					if (peer?.remoteDescription) {
						try {
							await peer.addIceCandidate(data.candidate);
						} catch (e) {
							console.error("Error adding received ice candidate", e);
						}
					}
				}
			};
		} else if (role === "participant") {
			const { start, connectYou, connectParticipant, disconnectParticipant } =
				useJoinBoxCreationState.getState().actions;
			this.ws = new WebSocket(SIGNALING_SERVER_URL);

			this.ws.onopen = () => {
				this.ws?.send(
					JSON.stringify({ type: "greeting", id: navigator.userAgent }),
				);
				start();
			};

			this.ws.onmessage = async (event) => {
				const data = JSON.parse(event.data);

				if (data.type === "id") {
					this.myId = data.id;
				} else if (data.type === "acknowledgeLeader") {
					connectYou({
						you: {
							id: this.myId ?? "id-not-assigned-probalby-error",
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
				} else if (data.type === "peerConnected") {
					console.log("peerConnected!!!!!!!!!!!");
					console.log("data.peerId", data.peerId);
					console.log(
						"useJoinBoxCreationState.getState().leader.id",
						useJoinBoxCreationState.getState().leader.id,
					);
					if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
						const peer = this.setupPeerConnection(data.peerId, true);
						const offer = await peer.createOffer();
						await peer.setLocalDescription(offer);
						this.ws?.send(
							JSON.stringify({ type: "offer", targetId: data.peerId, offer }),
						);
						console.log("peerConnected to state!!!!!!!!!!!");
						connectParticipant({
							id: data.peerId,
							name: "John Doe",
							userAgent: data.userAgent,
							device: "desktop",
						});
					}
				} else if (data.type === "peerDisconnected") {
					this.peerConnections.get(data.peerId)?.close();
					this.peerConnections.delete(data.peerId);
					this.dataChannels.delete(data.peerId);
					disconnectParticipant(data.peerId);
				} else if (data.type === "offer") {
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
				} else if (data.type === "answer") {
					const peer = this.peerConnections.get(data.senderId);
					if (peer && peer.signalingState !== "stable") {
						await peer.setRemoteDescription(data.answer);
					}
				} else if (data.type === "candidate") {
					const peer = this.peerConnections.get(data.senderId);
					if (peer?.remoteDescription) {
						try {
							await peer.addIceCandidate(data.candidate);
						} catch (e) {
							console.error("Error adding received ice candidate", e);
						}
					}
				}
			};
		}
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
			dc.onopen = () => {
				// Handle data channel open
			};
			dc.onclose = () => {
				// Handle data channel close
			};
			dc.onmessage = () => {
				// Handle incoming messages
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
}

export const webRTCService = new WebRTCService();
