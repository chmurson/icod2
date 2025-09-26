export type IConnectedPeersStorage = {
  addPeer: (peerId: string, info: { isRelay: boolean }) => void;
  removePeer: (peerId: string) => void;
  clear: () => void;
};

type EventMap = {
  "peer-added": (peerId: string, info: { isRelay: boolean }) => void;
  "peer-removed": (peerId: string) => void;
};

export class ConnectedPeerStorage implements IConnectedPeersStorage {
  private peers: Map<string, { isRelay: boolean }> = new Map();

  private callbacks: {
    [K in keyof EventMap]: EventMap[K][];
  } = {
    "peer-added": [],
    "peer-removed": [],
  };

  addPeer(peerId: string, info: { isRelay: boolean }) {
    this.peers.set(peerId, info);
    for (const clb of this.callbacks["peer-added"]) {
      clb(peerId, info);
    }
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
    for (const clb of this.callbacks["peer-removed"]) {
      clb(peerId);
    }
  }

  clear() {
    this.peers.clear();
  }

  addListener<T extends keyof EventMap>(
    event: T,
    callback: EventMap[T],
  ): () => void {
    this.callbacks[event].push(callback);

    return () => {
      (this.callbacks[event] as EventMap[T][]) = this.callbacks[event].filter(
        (cb) => cb !== callback,
      );
    };
  }

  removeListener<T extends keyof EventMap>(
    event: T,
    callback: EventMap[T],
  ): void {
    (this.callbacks[event] as EventMap[T][]) = this.callbacks[event].filter(
      (cb) => cb !== callback,
    ) as EventMap[T][];
  }
}
