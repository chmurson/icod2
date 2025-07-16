export type AcceptsOffersRequest = {
  type: "accepts-offers-request";
  token: string;
};

export function isAcceptsOffersRequest(
  payload: object,
): payload is AcceptsOffersRequest {
  return (
    "type" in payload &&
    payload.type === "accepts-offers-request" &&
    "token" in payload &&
    typeof payload.token === "string"
  );
}

export type AcceptsOffersResponse = {
  type: "accepts-offers-response";
  sessionToken: string;
};

export function isAcceptsOffersResponse(
  payload: object,
): payload is AcceptsOffersResponse {
  return (
    "type" in payload &&
    payload.type === "accepts-offers-response" &&
    "sessionToken" in payload &&
    typeof payload.sessionToken === "string"
  );
}

export type SendsOfferRequest = {
  type: "sends-offer-request";
  sessionToken: string;
};

export function isSendOfferRequest(
  payload: object,
): payload is SendsOfferRequest {
  return (
    "type" in payload &&
    payload.type === "sends-offer-request" &&
    "sessionToken" in payload &&
    typeof payload.sessionToken === "string"
  );
}

export type SendsOfferResponse = {
  type: "sends-offers-response";
  success: boolean;
  reason?: string;
};

export function isSendsOfferResponse(
  payload: object,
): payload is SendsOfferResponse {
  return (
    "type" in payload &&
    payload.type === "sends-offers-response" &&
    "success" in payload &&
    typeof payload.success === "boolean"
  );
}

export type OfferRequest = {
  type: "offer-request";
  offer: unknown;
  iceCandidates: unknown[];
};

export type AnswerRequest = {
  type: "answer-request";
  offer: unknown;
  iceCandidates: unknown[];
};

export function isAnswerReqquest() {}

export function isOfferRequest(payload: object): payload is OfferRequest {
  return (
    "type" in payload &&
    payload.type === "offer-request" &&
    "offer" in payload &&
    "iceCandidates" in payload
  );
}

export function isAnswerRequest(payload: object): payload is AnswerRequest {
  return (
    "type" in payload &&
    payload.type === "answer-request" &&
    "offer" in payload &&
    "iceCandidates" in payload
  );
}
