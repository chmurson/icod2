export class PeersMessageRouter {
  private routes: {
    condition: (arg: object) => boolean;
    handler: (peerId: string, arg: object, dataChannelManager: unknown) => void;
  }[] = [];

  addHandler<T extends object>(
    condition: (arg: object) => arg is T,
    handler: (peerId: string, msg: T, dataChannelManager?: unknown) => void,
  ) {
    this.routes.push({
      condition,
      handler: handler as (
        peerId: string,
        arg: object,
        dataChannelManager?: unknown,
      ) => void,
    });
  }

  clearHandlers() {
    this.routes = [];
  }

  router = (peerId: string, msg: object, dataChannelManager: unknown) => {
    for (const route of this.routes) {
      if (route.condition(msg)) {
        console.log(
          `Found route for ${"type" in msg ? msg.type : JSON.stringify(msg)}; peerId: ${peerId}`,
        );
        route.handler(peerId, msg, dataChannelManager);
        return;
      }
    }

    console.warn(
      "No route found for message:",
      "type" in msg ? msg.type : JSON.stringify(msg),
    );
  };
}
