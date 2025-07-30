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

export type CallerConnectionFailureReason =
  | "no-callee-available"
  | "fail-to-initialize-rtc-connection"
  | "peer-connection-state-failed"
  | "timeout-on-creating-offer-and-ice-candidates"
  | "timeout-on-getting-answer-from-callee"
  | "unknown-error";

const TIMETOUT_IN_MS = 120 * 1000;

export class CallerSignalingService
  implements
    SignalingService,
    SignalingServiceConnectionInitiator<CallerConnectionFailureReason>
{
  private websocketJSONHandler: WebsocketJSONHandler;
  private peerConnection?: RTCPeerConnection;
  private peerConnected = false;
  private dataChannel?: RTCDataChannel;
  private _onPeerConnected?: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void;
  private _onPeerConnecting?: () => void;
  private _onPeerDisconnected?: (peerConnection: RTCPeerConnection) => void;
  private _failedToConnect?: (reason: CallerConnectionFailureReason) => void;
  private _onSignalingServerConnected?: () => void;
  private _peerConnectingTimeout?: number;

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

  close(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.websocketJSONHandler.close();
  }

  get onSignalingServerConnected(): (() => void) | undefined {
    return this._onSignalingServerConnected;
  }

  set onSignalingServerConnected(callback: () => void) {
    this._onSignalingServerConnected = callback;
  }

  set onPeerConnecting(clb: () => void) {
    this._onPeerConnecting = clb;
  }

  get onPeerConnecting(): (() => void) | undefined {
    return this._onPeerConnecting;
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
    | ((reason: CallerConnectionFailureReason) => void)
    | undefined {
    return this._failedToConnect;
  }

  set onFailedToConnect(callback: (
    reason: CallerConnectionFailureReason,
  ) => void) {
    this._failedToConnect = callback;
  }

  private startPeerConnectingTimeout() {
    this._peerConnectingTimeout = window.setTimeout(() => {
      this.onFailedToConnect?.("timeout-on-getting-answer-from-callee");
    }, TIMETOUT_IN_MS);
  }

  private stopPeerConnectingTimeout() {
    window.clearTimeout(this._peerConnectingTimeout);
  }

  private initRTCConnection() {
    if (this.peerConnection) {
      return;
    }

    this.peerConnection = new RTCPeerConnection();

    this.dataChannel = this.peerConnection.createDataChannel("chat");

    this.dataChannel.onopen = () => {
      console.log("data channel open");
      this.dataChannel?.send(callerIntroduction);
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data !== calleeIntroduction) {
        return;
      }
      if (this.peerConnection && !this.peerConnected && this.dataChannel) {
        this.peerConnected = true;
        this.stopPeerConnectingTimeout();
        this.onPeerConnected?.(this.peerConnection, this.dataChannel);
        this.peerConnection?.getStats().then((stats) => {
          console.log(stats);
        });
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
      console.log("connetion state", this.peerConnection?.connectionState);

      if (this.peerConnection?.connectionState === "failed") {
        this.stopPeerConnectingTimeout();
        this.onFailedToConnect?.("peer-connection-state-failed");
      }

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

    this.onSignalingServerConnected?.();

    this.initRTCConnection();

    if (!this.peerConnection) {
      this.onFailedToConnect?.("fail-to-initialize-rtc-connection");
      console.error("Peer connection is not initialized");
      return;
    }

    this.onPeerConnecting?.();

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), TIMETOUT_IN_MS);
      });

      const { offer, iceCandidates } = await Promise.race([
        createOfferAndAllIceCandidate(this.peerConnection),
        timeoutPromise,
      ]);

      this.sendOfferRequest({ offer, iceCandidates });

      this.startPeerConnectingTimeout();
    } catch (error) {
      if (error instanceof Error && error.message === "Timeout") {
        this.onFailedToConnect?.(
          "timeout-on-creating-offer-and-ice-candidates",
        );
        return;
      }
      throw error;
    }
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
