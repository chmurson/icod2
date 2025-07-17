import type { SignalingConnection } from "./SignalingConnection";

export class MatchedSignalingConnectionsProvider {
  private connections: WeakMap<{ id: string }, SignalingConnection> =
    new WeakMap();
  private ids: Set<{ id: string }> = new Set();

  add(id: string, connection: SignalingConnection) {
    const foundIdObject = this.findIdObject(id);

    if (foundIdObject && this.connections.has(foundIdObject)) {
      console.warn(`Connection with id ${id} already exists.`);
      return;
    }

    const newIdObject = { id };

    this.connections.set(newIdObject, connection);
    this.ids.add(newIdObject);
  }

  remove(id: string) {
    const foundIdObject = this.findIdObject(id);

    if (!foundIdObject) {
      return;
    }

    const connection = this.connections.get(foundIdObject);

    if (connection) {
      this.connections.delete(foundIdObject);
    }

    this.ids.delete(foundIdObject);
  }

  findOneThatAcceptsOffers() {
    for (const idObject of this.ids) {
      const connection = this.connections.get(idObject);
      if (connection && connection.state?.mode === "acceptsOffers") {
        return connection;
      }
    }
  }

  private findIdObject(id: string) {
    return [...this.ids.values()].find((idObj) => idObj.id === id);
  }
}
