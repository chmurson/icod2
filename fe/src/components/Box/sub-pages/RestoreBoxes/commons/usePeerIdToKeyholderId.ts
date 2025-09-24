export class PeerIdKeyholderMap {
  private mapPeerIdToKeyHolderId: Map<string, string>;

  constructor() {
    this.mapPeerIdToKeyHolderId = new Map<string, string>();
  }

  public getPeerId(keyHolderId: string): string | undefined {
    for (const [
      peerId,
      currentKeyHolderId,
    ] of this.mapPeerIdToKeyHolderId.entries()) {
      if (currentKeyHolderId === keyHolderId) {
        return peerId;
      }
    }
    return undefined;
  }

  public getKeyholderId(peerId: string): string | undefined {
    return this.mapPeerIdToKeyHolderId.get(peerId);
  }

  public removeByKeyHolderId(keyHolderId: string) {
    const peerId = this.getPeerId(keyHolderId);
    if (peerId) {
      this.removeByPeerId(peerId);
    }
  }

  public removeByPeerId(peerId: string) {
    this.mapPeerIdToKeyHolderId.delete(peerId);
  }

  public setPair({
    peerId,
    keyHolderId,
  }: {
    peerId: string;
    keyHolderId: string;
  }): void {
    this.mapPeerIdToKeyHolderId.set(peerId, keyHolderId);
  }
}
