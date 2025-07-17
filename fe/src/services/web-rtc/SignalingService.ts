import type {
  AcknowledgeLeaderMessage,
  IdMessage,
  PeerConnectedMessage,
  PeerDisconnectedMessage,
  SignalingMessage,
} from "@icod2/contracts";
import { handleBoxInfo, handleCreateBox } from "./handlers/businessHandlers";
import {
  handleAcknowledgeLeader,
  handleId,
  handlePeerConnected,
  handlePeerDisconnected,
} from "./handlers/signalingHandlers";
import {
  handleAnswer,
  handleCandidate,
  handleOffer,
} from "./handlers/webrtcHandlers";
import type { WebRTCHandlerContext, WebRTCMessageHandler } from "./types";

export class SignalingService {
  private ws: WebSocket | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private dataChannels = new Map<string, RTCDataChannel>();
  private myId: string | null = null;
  private handlerRegistry: Record<string, WebRTCMessageHandler>;

  constructor() {
    this.handlerRegistry = {
      id: handleId,
      acknowledgeLeader: handleAcknowledgeLeader,
      peerConnected: handlePeerConnected,
      peerDisconnected: handlePeerDisconnected,
      offer: handleOffer,
      answer: handleAnswer,
      candidate: handleCandidate,
      createBox: handleCreateBox,
      boxInfo: handleBoxInfo,
    };
  }

  connect({
    userName,
    onId,
    onAcknowledgeLeader,
    onPeerConnected,
    onPeerDisconnected,
    onStart,
  }: {
    userName: string;
    onId?: (data: IdMessage) => void;
    onAcknowledgeLeader?: (data: AcknowledgeLeaderMessage) => void;
    onPeerConnected: (data: PeerConnectedMessage) => Promise<void>;
    onPeerDisconnected: (data: PeerDisconnectedMessage) => void;
    onStart?: () => void;
  }) {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    const port = import.meta.env.VITE_SIGNALING_PORT;
    const hosname = import.meta.env.VITE_SIGNALING_HOSTNAME;
    const url = `ws://${hosname}:${port}`;

    this.ws = new WebSocket(url);

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
      const ctx: WebRTCHandlerContext = {
        myId: this.myId,
        ws: this.ws as WebSocket,
        peerConnections: this.peerConnections,
        dataChannels: this.dataChannels,
        signalingService: this,
        onId,
        onAcknowledgeLeader,
        onPeerConnected,
        onPeerDisconnected,
      };
      const handler = this.handlerRegistry[data.type];
      if (handler) {
        await handler(data, ctx);
      } else {
        console.warn("[WebRTC] Unknown message type:", data.type);
      }
    };
  }

  getPeerConnections() {
    return this.peerConnections;
  }

  getDataChannels() {
    return this.dataChannels;
  }

  getMyId() {
    return this.myId;
  }

  setMyId(id: string) {
    this.myId = id;
  }

  getWebSocket() {
    return this.ws;
  }

  setupPeerConnection(peerId: string, isInitiator: boolean): RTCPeerConnection {
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
        console.log(`[WebRTC] Data channel opened for peer ${peerId}`);
      };
      dc.onclose = () => {
        console.log(`[WebRTC] Data channel closed for peer ${peerId}`);
      };
      dc.onmessage = (ev) => {
        const message = JSON.parse(ev.data);
        // Handle incoming messages through the handler registry
        const handler = this.handlerRegistry[message.type];
        if (handler) {
          const ctx: WebRTCHandlerContext = {
            myId: this.myId,
            ws: this.ws as WebSocket,
            peerConnections: this.peerConnections,
            dataChannels: this.dataChannels,
          };
          handler(message, ctx);
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
}
