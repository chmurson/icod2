import { logger } from "@icod2/protocols";
import type {
  DataChannelManager,
  PossibleSignalingServie,
} from "./DataChannelManager";

export class DataChannelMessageRouter<
  TSignalingService extends PossibleSignalingServie<TConnectionFailReason>,
  TConnectionFailReason = unknown,
> {
  private routes: {
    condition: (arg: object) => boolean;
    handler: (
      peerId: string,
      arg: object,
      dataChannelManager: DataChannelManager<
        TSignalingService,
        TConnectionFailReason
      >,
    ) => void;
  }[] = [];

  addHandler<T extends object>(
    condition: (arg: object) => arg is T,
    handler: (
      peerId: string,
      msg: T,
      dataChannelManager?: DataChannelManager<
        TSignalingService,
        TConnectionFailReason
      >,
    ) => void,
  ) {
    this.routes.push({
      condition,
      handler: handler as (
        peerId: string,
        arg: object,
        dataChannelManager?: DataChannelManager<
          TSignalingService,
          TConnectionFailReason
        >,
      ) => void,
    });
  }

  clearHandlers() {
    this.routes = [];
  }

  router = (
    peerId: string,
    msg: object,
    dataChannelManager: DataChannelManager<
      TSignalingService,
      TConnectionFailReason
    >,
  ) => {
    for (const route of this.routes) {
      if (route.condition(msg)) {
        logger.log(
          `Found route for ${"type" in msg ? msg.type : JSON.stringify(msg)}; peerId: ${peerId}`,
        );
        route.handler(peerId, msg, dataChannelManager);
        return;
      }
    }

    logger.warn(
      "No route found for message:",
      "type" in msg ? msg.type : JSON.stringify(msg),
    );
  };
}
