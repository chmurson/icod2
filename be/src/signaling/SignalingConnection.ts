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
} from "@icod2/contracts/dist/client-server/index.js";
import { v4 as uuidv4 } from "uuid";
import type { WebSocket } from "ws";
import type { MatchedSignalingConnectionsProvider } from "./MatchedSignalingConnectionsProvider";
import { WebsocketJSONHandler } from "./WebSocketJSONHandler";

export class SignalingConnection {
  private websocketJSONHandler;

  private _state:
    | undefined
    | { mode: "acceptsOffers"; offerSender?: SignalingConnection }
    | { mode: "sendsOffer"; matchedAcceptor: SignalingConnection };

  public readonly localID: string = uuidv4();

  constructor(
    websocket: WebSocket,
    private connectionMatchProvider: MatchedSignalingConnectionsProvider,
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
  get state() {
    return this._state;
  }

  private set state(value: typeof this._state) {
    this._state = value;
  }

  public sendOffer(
    payload: OfferRequest,
    offerSenderConnection: SignalingConnection,
  ) {
    if (this.state?.mode !== "acceptsOffers") {
      return console.error(
        "Cannot send offer to a connection which is not in accepts mode",
      );
    }

    this.state.offerSender = offerSenderConnection;
    this.websocketJSONHandler.send(payload);
  }

  public sendAnswer(payload: AnswerRequest) {
    if (this.state?.mode !== "sendsOffer") {
      return console.error(
        "Cannot send answer to a connection which is not in sends mode",
      );
    }

    this.websocketJSONHandler.send(payload);
  }

  close() {
    this.state = undefined;
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

    console.warn(payload.sessionToken, "sessionToken is ignored for now");

    const firstAwaitingOffers =
      this.connectionMatchProvider.findOneThatAcceptsOffers();

    if (firstAwaitingOffers) {
      this.state = {
        mode: "sendsOffer",
        matchedAcceptor: firstAwaitingOffers,
      };
    }

    if (!firstAwaitingOffers) {
      return this.websocketJSONHandler.send({
        type: "sends-offers-response",
        success: !!firstAwaitingOffers,
        reason: "no-callee-available",
      } satisfies SendsOfferResponse);
    }

    return this.websocketJSONHandler.send({
      type: "sends-offers-response",
      success: true,
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
