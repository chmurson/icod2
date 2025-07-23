import {
  calleeIntroduction,
  callerIntroduction,
} from "@icod2/contracts/src/client-client";
import {
  type AcceptsOffersRequest,
  type AcceptsOffersResponse,
  type AnswerRequest,
  isAcceptsOffersResponse,
  isOfferRequest,
  type OfferRequest,
} from "@icod2/contracts/src/client-server";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import type { SignalingService } from "./SignalingService";
import { consumeOfferAndIceCandidates } from "./utils/consumeOfferAndIceCandidates";

export class CalleeSignalingService implements SignalingService {
  private websocketJSONHandler: WebsocketJSONHandler;
  private token: string;
  private peerConnections: Map<
    string,
    { peer: RTCPeerConnection; dataChannel?: RTCDataChannel }
  > = new Map();
  private _onPeerConnected?: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void;
  private _onPeerDisconnected?: (peerConnection: RTCPeerConnection) => void;
  private _onConnected?: () => void;

  constructor(websocketJSONHandler: WebsocketJSONHandler) {
    this.websocketJSONHandler = websocketJSONHandler;

    this.registerHandlers();
    this.token = this.generateUniqueToken();
  }

  start(): void {
    this.sendAcceptOffersRequest();
    this.initRTCConnection();
  }

  get onConnected(): (() => void) | undefined {
    return this._onConnected;
  }

  set onConnected(callback: () => void) {
    this._onConnected = callback;
  }

  getToken(): string {
    return this.token;
  }

  get onPeerConnected():
    | ((peerConnection: RTCPeerConnection, dataChannel: RTCDataChannel) => void)
    | undefined {
    return this._onPeerConnected;
  }

  set onPeerConnected(callback: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void) {
    this._onPeerConnected = callback;
  }

  get onPeerDisconnected():
    | ((peerConnection: RTCPeerConnection) => void)
    | undefined {
    return this._onPeerDisconnected;
  }

  set onPeerDisconnected(callback: (
    peerConnection: RTCPeerConnection,
  ) => void) {
    this._onPeerDisconnected = callback;
  }

  close(): void {
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.dataChannel?.close();
      peerConnection.peer.close();
    });
    this.peerConnections.clear();
    this.websocketJSONHandler.close();
  }

  private initRTCConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection();
    const peerConnectionId = this.generateUniqueToken();

    this.peerConnections.set(peerConnectionId, {
      peer: peerConnection,
      dataChannel: undefined,
    });

    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;

      dataChannel.onopen = () => {
        this.peerConnections.set(peerConnectionId, {
          peer: peerConnection,
          dataChannel,
        });

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === "disconnected") {
            this.onPeerDisconnected?.(peerConnection);
          }
          this.peerConnections.delete(peerConnectionId);
          peerConnection.close();
          dataChannel.close();
        };
      };

      dataChannel.onmessage = (event) => {
        if (event.data === callerIntroduction) {
          this.onPeerConnected?.(peerConnection, dataChannel);
        }
      };

      dataChannel.send(calleeIntroduction);
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
    this.websocketJSONHandler.onSpecificMessage(
      isAcceptsOffersResponse,
      this.handleAcceptsOffersResponse.bind(this),
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

  private handleAcceptsOffersResponse(data: AcceptsOffersResponse) {
    console.log("priting sessionToken for now", data.sessionToken);
    this.onConnected?.();
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
