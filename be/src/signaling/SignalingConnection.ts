import {
  type AcceptsOffersResponse,
  type AnswerRequest,
  isAcceptsOffersRequest,
  isAnswerRequest,
  isOfferRequest,
  isSendOfferRequest,
  type OfferRequest,
  type SendsOfferRequest,
  type SendsOfferResponse,
} from "@icod2/contracts/src/client-server";
import { v4 as uuidv4 } from "uuid";
import type { WebSocket } from "ws";
import { WebsocketJSONHandler } from "./WebSocketJSONHandler";

export class SignalingConnection {
  private websocketJSONHandler;

  private state:
    | undefined
    | { mode: "acceptsOffers"; offerSender?: SignalingConnection }
    | { mode: "sendsOffer"; matchedAcceptor: SignalingConnection };
  private sessionToken: string | undefined;

  constructor(
    websocket: WebSocket,
    private otherSignalingConnections: SignalingConnection[],
  ) {
    this.websocketJSONHandler = new WebsocketJSONHandler(websocket, true);
    this.websocketJSONHandler.onSpecificMessage(
      isAcceptsOffersRequest,
      this.handleAcceptsOffersRequest.bind(this),
    );
    this.websocketJSONHandler.onSpecificMessage(
      isSendOfferRequest,
      this.handleSendsOfferRequest.bind(this),
    );
    this.websocketJSONHandler.onSpecificMessage(
      isOfferRequest,
      this.handleOfferRequest.bind(this),
    );
    this.websocketJSONHandler.onSpecificMessage(
      isAnswerRequest,
      this.handleAnswerRequest.bind(this),
    );
  }

  public getState() {
    return this.state;
  }

  public sendOffer(
    payload: OfferRequest,
    offerSenderConnection: SignalingConnection,
  ) {
    if (this.state?.mode !== "acceptsOffers") {
      throw new Error(
        "Cannot send offer to a connection which is not in accepts mode",
      );
    }

    this.state.offerSender = offerSenderConnection;
    this.websocketJSONHandler.send(payload);
  }

  public sendAnswer(payload: AnswerRequest) {
    if (this.state?.mode !== "sendsOffer") {
      throw new Error(
        "Cannot send answer to a connection which is not in sends mode",
      );
    }

    this.websocketJSONHandler.send(payload);
  }

  private handleAnswerRequest(payload: AnswerRequest) {
    if (
      this.state?.mode !== "acceptsOffers" ||
      this.state.offerSender === undefined
    ) {
      return;
    }

    this.state.offerSender.sendAnswer(payload);
  }

  private handleOfferRequest(payload: OfferRequest) {
    if (this.state?.mode !== "sendsOffer") {
      return;
    }

    this.state.matchedAcceptor.sendOffer(payload, this);
  }

  private handleSendsOfferRequest(payload: SendsOfferRequest) {
    if (this.state !== undefined) {
      return;
    }

    this.sessionToken = payload.sessionToken;
    console.warn(payload.sessionToken, "sessionToken is ignored for now");

    const firstAwaitingOffers = this.otherSignalingConnections.find(
      (x) => x.getState()?.mode === "acceptsOffers",
    );

    if (firstAwaitingOffers) {
      this.state = {
        mode: "sendsOffer",
        matchedAcceptor: firstAwaitingOffers,
      };
    }

    this.websocketJSONHandler.send({
      type: "sends-offers-response",
      success: !!firstAwaitingOffers,
      reason: "No one is currently waiting to receive offers",
    } satisfies SendsOfferResponse);
  }

  private handleAcceptsOffersRequest() {
    if (this.state !== undefined) {
      return;
    }

    this.state = { mode: "acceptsOffers" };

    const sessionToken = uuidv4();
    this.websocketJSONHandler.send({
      type: "accepts-offers-response",
      sessionToken: sessionToken,
    } satisfies AcceptsOffersResponse);
  }
}
