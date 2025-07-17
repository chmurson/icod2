export class DataChannelMessageRouter {
  private routes: {
    condition: (arg: object) => boolean;
    handler: (locaID: string, arg: object) => void;
  }[] = [];

  addHandler<T extends object>(
    condition: (arg: object) => arg is T,
    handler: (localId: string, msg: T) => void,
  ) {
    this.routes.push({
      condition,
      handler: handler as (localId: string, arg: object) => void,
    });
  }

  clearHandlers() {
    this.routes = [];
  }

  router = (localId: string, msg: object) => {
    for (const route of this.routes) {
      if (route.condition(msg)) {
        route.handler(localId, msg);
        return;
      }
    }

    console.warn("No route found for message:", msg);
  };
}
