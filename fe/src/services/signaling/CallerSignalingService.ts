import {
  calleeIntroduction,
  callerIntroduction,
} from "@icod2/contracts/src/client-client";
import {
  type AnswerRequest,
  isAnswerRequest,
  isSendsOfferResponse,
  type OfferRequest,
  type SendsOfferRequest,
  type SendsOfferResponse,
} from "@icod2/contracts/src/client-server";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import type {
  SignalingService,
  SignalingServiceConnectionInitiator,
} from "./SignalingService";
import {
  consumeAnswer,
  createOfferAndAllIceCandidate,
} from "./utils/callerPeerConnectionUtils";

export type ConnectionFailureReason =
  | "no-callee-available"
  | "fail-to-initialize-rtc-connection"
  | "unknown-error";

export class CallerSignalingService
  implements
    SignalingService,
    SignalingServiceConnectionInitiator<ConnectionFailureReason>
{
  private websocketJSONHandler: WebsocketJSONHandler;
  private peerConnection?: RTCPeerConnection;
  private peerConnected = false;
  private dataChannel?: RTCDataChannel;
  private _onPeerConnected?: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void;
  private _onPeerDisconnected?: (peerConnection: RTCPeerConnection) => void;
  private _failedToConnect?: (reason: ConnectionFailureReason) => void;
  private _onConnected?: () => void;

  constructor(websocketJSONHandler: WebsocketJSONHandler) {
    this.websocketJSONHandler = websocketJSONHandler;

    this.registerHandlers();
  }

  start(): void {
    this.sendSendsOfferRequest();
  }

  getToken(): string {
    return "";
  }

  get onConnected(): (() => void) | undefined {
    return this._onConnected;
  }

  set onConnected(callback: () => void) {
    this._onConnected = callback;
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

  get onFailedToConnect():
    | ((reason: ConnectionFailureReason) => void)
    | undefined {
    return this._failedToConnect;
  }

  set onFailedToConnect(callback: (reason: ConnectionFailureReason) => void) {
    this._failedToConnect = callback;
  }

  close(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.websocketJSONHandler.close();
  }

  private initRTCConnection() {
    if (this.peerConnection) {
      return;
    }

    this.peerConnection = new RTCPeerConnection();

    this.dataChannel = this.peerConnection.createDataChannel("chat");

    this.dataChannel.onopen = () => {
      this.dataChannel?.send(callerIntroduction);
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data !== calleeIntroduction) {
        return;
      }
      if (this.peerConnection && !this.peerConnected && this.dataChannel) {
        this.peerConnected = true;
        this.onPeerConnected?.(this.peerConnection, this.dataChannel);
      } else {
        console.warn(
          "Received ",
          calleeIntroduction,
          "but connection not accepted",
          {
            peerConnection: this.peerConnection,
            peerConnected: this.peerConnected,
            dataChannel: this.dataChannel,
          },
        );
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === "disconnected") {
        if (this.peerConnected && this.peerConnection) {
          this.onPeerDisconnected?.(this.peerConnection);
        }
        this.peerConnected = false;
        this.peerConnection?.close();
        this.dataChannel?.close();
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
      const reason =
        {
          "no-callee-available": "no-callee-available" as const,
          other: "unknown-error" as const,
        }[data.reason ?? "other"] ?? ("unknown-error" as const);

      this.onFailedToConnect?.(reason);
      return;
    }

    this.initRTCConnection();

    if (!this.peerConnection) {
      this.onFailedToConnect?.("fail-to-initialize-rtc-connection");
      console.error("Peer connection is not initialized");
      return;
    }

    this.onConnected?.();

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
