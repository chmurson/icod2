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
      localID: string,
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
      localId: string,
      msg: T,
      dataChannelManager?: DataChannelManager<
        TSignalingService,
        TConnectionFailReason
      >,
    ) => void,
  ) {
    console.log();
    this.routes.push({
      condition,
      handler: handler as (
        localId: string,
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
    localId: string,
    msg: object,
    dataChannelManager: DataChannelManager<
      TSignalingService,
      TConnectionFailReason
    >,
  ) => {
    for (const route of this.routes) {
      if (route.condition(msg)) {
        route.handler(localId, msg, dataChannelManager);
        return;
      }
    }

    console.log("localId", localId);
    console.log("msg", msg);
    console.log("this.routes", this.routes);

    console.warn("No route found for message:", msg);
  };
}
