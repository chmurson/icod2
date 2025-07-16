import {
  type AnswerRequest,
  isAnswerRequest,
  isSendsOfferResponse,
  type OfferRequest,
  type SendsOfferRequest,
  type SendsOfferResponse,
} from "@icod2/contracts/src/client-server";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import {
  consumeAnswer,
  createOfferAndAllIceCandidate,
} from "./callerPeerConnectionUtils";

export class CallerSignalingService {
  private websocketJSONHandler: WebsocketJSONHandler;
  private peerConnection?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private _onPeerConnected?: (peerConnection: RTCPeerConnection) => void;

  constructor(websocketJSONHandler: WebsocketJSONHandler) {
    this.websocketJSONHandler = websocketJSONHandler;

    this.registerHandlers();
  }

  start(): void {
    this.sendSendsOfferRequest();
  }

  get onPeerConnected():
    | ((peerConnection: RTCPeerConnection) => void)
    | undefined {
    return this._onPeerConnected;
  }

  set onPeerConnected(callback: (peerConnection: RTCPeerConnection) => void) {
    this._onPeerConnected = callback;
  }

  close(): void {
    console.log("[DEBUG][CallerSignalingService]close()");
    this.peerConnection?.close();
    this.dataChannel?.close();
    this.websocketJSONHandler.close();
  }

  private initRTCConnection() {
    if (this.peerConnection) {
      return;
    }

    this.peerConnection = new RTCPeerConnection();

    this.dataChannel = this.peerConnection.createDataChannel("chat");

    this.dataChannel.onopen = () => {
      console.log("Data channel open!");
      this.dataChannel?.send("Hello from Caller");
    };
    this.dataChannel.onmessage = (event) =>
      console.log("Received from Callee:", event.data);
    this.dataChannel.onmessage = (event) => {
      event.data === "Hello from Callee";
      if (this.peerConnection) {
        this.onPeerConnected?.(this.peerConnection);
      }
    };
  }

  private registerHandlers(): void {
    this.websocketJSONHandler.onSpecificMessage(
      isSendsOfferResponse,
      this.handleSendsOfferResponse.bind(this),
    );
    this.websocketJSONHandler.onSpecificMessage(
      isAnswerRequest,
      this.handleAnswerRequest.bind(this),
    );
  }

  private sendSendsOfferRequest(): void {
    this.websocketJSONHandler.send({
      type: "sends-offer-request",
      sessionToken: "",
    } satisfies SendsOfferRequest);
  }

  private sendOfferRequest(payload: {
    offer: unknown;
    iceCandidates: unknown[];
  }): void {
    this.websocketJSONHandler.send({
      type: "offer-request",
      offer: payload.offer,
      iceCandidates: payload.iceCandidates,
    } satisfies OfferRequest);
  }

  private async handleSendsOfferResponse(data: SendsOfferResponse) {
    if (!data.success) {
      console.error("Failed to send offer request");
      return;
    }

    this.initRTCConnection();

    if (!this.peerConnection) {
      console.error("Peer connection is not initialized");
      return;
    }

    const { offer, iceCandidates } = await createOfferAndAllIceCandidate(
      this.peerConnection,
    );
    console.log("offer", offer);

    this.sendOfferRequest({ offer, iceCandidates });
  }

  private async handleAnswerRequest(data: AnswerRequest) {
    if (!this.peerConnection) {
      console.error("Peer connection is not initialized");
      return;
    }

    await consumeAnswer(
      {
        answer: data.offer as RTCSessionDescriptionInit,
        iceCandidates: data.iceCandidates as RTCIceCandidate[],
      },
      this.peerConnection,
    );
  }
}

// take ws api -> request that accepts offers
// accept response -> that requests are being accepted
// accept offer; consume it; create answer and send it back
// test connection
