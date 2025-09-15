export type ConnectedPeersStorage = {
  addPeer: (peerId: string, info: { isRelay: boolean }) => void;
  removePeer: (peerId: string) => void;
};

export class ConnectedPeerStorage implements ConnectedPeersStorage {
  private peers: Map<string, { isRelay: boolean }> = new Map();

  addPeer(peerId: string, info: { isRelay: boolean }) {
    this.peers.set(peerId, info);
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
  }
}
