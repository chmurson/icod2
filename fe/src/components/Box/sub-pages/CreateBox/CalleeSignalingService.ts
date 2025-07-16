import {
  type AcceptsOffersRequest,
  type AnswerRequest,
  isOfferRequest,
  type OfferRequest,
} from "@icod2/contracts/src/client-server";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import { consumeOfferAndIceCandidates } from "./consumeOfferAndIceCandidates";

export class CalleeSignalingService {
  private websocketJSONHandler: WebsocketJSONHandler;
  private token: string;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private _onPeerConnected?: (peerConnection: RTCPeerConnection) => void;

  constructor(websocketJSONHandler: WebsocketJSONHandler) {
    this.websocketJSONHandler = websocketJSONHandler;

    this.registerHandlers();
    this.token = this.generateUniqueToken();
  }

  start(): void {
    this.sendAcceptOffersRequest();
    this.initRTCConnection();
  }

  getToken(): string {
    return this.token;
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
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    this.websocketJSONHandler.close();
  }

  private initRTCConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection();
    const peerConnectionId = this.generateUniqueToken();

    this.peerConnections.set(peerConnectionId, peerConnection);

    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => console.log("Data channel open!");
      dataChannel.onmessage = (event) =>
        console.log("Received from Keyholder:", event.data);
      dataChannel.onmessage = (event) => {
        event.data === "Hello from Celler";
        this.onPeerConnected?.(peerConnection);
      };
      dataChannel.send("Hello from Cellee");
    };

    return peerConnection;
  }

  private generateUniqueToken(): string {
    return Math.random().toString(36).substring(2, 15); //todo: implement a proper token generation
  }

  private registerHandlers(): void {
    this.websocketJSONHandler.onSpecificMessage(
      isOfferRequest,
      this.handleOfferRequest.bind(this),
    );
  }

  private sendAcceptOffersRequest(): void {
    this.websocketJSONHandler.send({
      type: "accepts-offers-request",
      token: this.token,
    } satisfies AcceptsOffersRequest);
  }

  private sendAnswer(payload: {
    answer: unknown;
    iceCandidates: unknown[];
  }): void {
    this.websocketJSONHandler.send({
      type: "answer-request",
      offer: payload.answer,
      iceCandidates: payload.iceCandidates,
    } satisfies AnswerRequest);
  }

  private async handleOfferRequest(data: OfferRequest) {
    const peerConnection = this.initRTCConnection();
    const answerPayload = await consumeOfferAndIceCandidates(
      data as {
        offer: RTCSessionDescriptionInit;
        iceCandidates: RTCIceCandidate[];
      },
      peerConnection,
    );

    this.sendAnswer(answerPayload);
  }
}
