import { loggerGate, shortenPeerId } from "@icod2/protocols";
import type { BasicProtoInterface } from "./types";

export class PeersMessageRouter<
  TPayload extends object,
  TProto extends BasicProtoInterface<TPayload>,
> {
  private routes: {
    condition: (arg: object) => boolean;
    handler: (peerId: string, arg: object, proto: TProto) => void;
  }[] = [];

  addHandler<T extends TPayload>(
    condition: (arg: object) => arg is T,
    handler: (peerId: string, msg: T, proto: TProto) => void,
  ) {
    this.routes.push({
      condition,
      handler: handler as (peerId: string, arg: object, proto: TProto) => void,
    });
  }

  clearHandlers() {
    this.routes = [];
  }

  router = (peerId: string, msg: object, proto: TProto) => {
    for (const route of this.routes) {
      if (route.condition(msg)) {
        loggerGate.canLog &&
          console.log(
            `Found route for ${"type" in msg ? msg.type : JSON.stringify(msg)}; peerId: ${shortenPeerId(peerId)}`,
          );
        route.handler(peerId, msg, proto);
        return;
      }
    }

    loggerGate.canWarn &&
      console.warn(
        "No route found for message:",
        "type" in msg ? msg.type : JSON.stringify(msg),
      );
  };
}
