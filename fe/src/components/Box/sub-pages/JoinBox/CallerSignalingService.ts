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
  private _onPeerConnected?: (peerConnection: RTCPeerConnection) => void;

  constructor(websocketJSONHandler: WebsocketJSONHandler) {
    this.websocketJSONHandler = websocketJSONHandler;

    this.registerHandlers();
  }

  start(): void {
    this.sendSendsOfferRequest();
    this.initRTCConnection();
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
    this.peerConnection?.close();
    this.websocketJSONHandler.close();
  }

  private initRTCConnection() {
    this.peerConnection = new RTCPeerConnection();

    this.peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => console.log("Data channel open!");
      dataChannel.onmessage = (event) =>
        console.log("Received from Keyholder:", event.data);
      dataChannel.onmessage = (event) => {
        event.data === "Hello from Callee";
        if (this.peerConnection) {
          this.onPeerConnected?.(this.peerConnection);
        }
      };
      dataChannel.send("Hello from Caller");
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
      token: "",
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
