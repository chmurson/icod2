import type { PeerId, PeerUpdate } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import type { Multiaddr } from "@multiformats/multiaddr";
import type { Libp2p } from "libp2p";
import { isEnabled } from "@/utils/featureFlags";

export class PersistingDialer {
  private peersToDial: Map<
    string,
    {
      isCurrentlyDialing: boolean;
    }
  > = new Map();
  private queuedPeersToDialByIds: string[] = [];
  private libp2p: Libp2p;
  private listeners: ((peerIdStr: string) => void)[] = [];

  constructor(
    libp2p: Libp2p,
    options: {
      onSuccessfullyDialedPeer?: (peerIdStr: string) => void;
    } = {},
  ) {
    this.libp2p = libp2p;

    libp2p.addEventListener("peer:update", this.peerUpdateHandler);
    libp2p.addEventListener("peer:disconnect", (_arg) => {});

    if (options.onSuccessfullyDialedPeer) {
      this.listeners.push(options.onSuccessfullyDialedPeer);
    }
  }

  addOnPeerDialedListener(listener: (peerIdStr: string) => void) {
    this.listeners.push(listener);
  }

  removeOnPeerDialedListener(listener: (peerIdStr: string) => void) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  add(peerId: string) {
    if (this.peersToDial.has(peerId)) {
      return;
    }

    this.peersToDial.set(peerId, { isCurrentlyDialing: false });
  }

  [Symbol.dispose]() {
    if (this.libp2p && typeof this.libp2p.removeEventListener === "function") {
      this.libp2p.removeEventListener("peer:update", this.peerUpdateHandler);
      this.libp2p.removeEventListener(
        "peer:disconnect",
        this.peerDisconnectedHandler,
      );
      this.peersToDial.clear();
    }
  }

  private callAllListeners(peerIdStr: string) {
    for (const listener of this.listeners) {
      listener(peerIdStr);
    }
  }

  private peerDisconnectedHandler = async (evt: CustomEvent<PeerId>) => {
    const peerIdStr = evt.detail.toString();
    const peerToDial = this.peersToDial.get(peerIdStr);

    if (!peerToDial) {
      return;
    }

    if (!peerToDial.isCurrentlyDialing) {
      this.peersToDial.delete(peerIdStr);
    }

    const index = this.queuedPeersToDialByIds.indexOf(peerIdStr);

    if (index !== -1) {
      this.queuedPeersToDialByIds.splice(index, 1);
    }
  };

  private peerUpdateHandler = async (evt: CustomEvent<PeerUpdate>) => {
    const peerIdStr = evt.detail.peer.id.toString();
    const peerToDial = this.peersToDial.get(peerIdStr);

    if (!peerToDial) {
      return;
    }

    if (peerToDial.isCurrentlyDialing) {
      this.queuedPeersToDialByIds.push(peerIdStr);
      return;
    }

    await this.dial(
      peerIdStr,
      evt.detail.peer.addresses.map((a) => a.multiaddr),
    );
  };

  private async triggerDialFromQueue(peerIdStr: string) {
    if (this.queuedPeersToDialByIds.length === 0) {
      return;
    }

    const index = this.queuedPeersToDialByIds.indexOf(peerIdStr);
    if (index !== -1) {
      this.queuedPeersToDialByIds.splice(index, 1);
    }

    await this.dial(peerIdStr);
  }

  private async dial(peerIdStr: string, multiAddrs?: Multiaddr[]) {
    const peerToDial = this.peersToDial.get(peerIdStr);

    if (!peerToDial) {
      throw new Error(`Peer ${peerIdStr} not found`);
    }

    if (peerToDial.isCurrentlyDialing) {
      console.log(`Peer ${peerIdStr} is already being dialed`);
      return;
    }

    peerToDial.isCurrentlyDialing = true;

    try {
      let connection: Awaited<ReturnType<typeof this.libp2p.dial>>;

      if (!multiAddrs) {
        const peerId = peerIdFromString(peerIdStr);
        console.log(`Trying to dial peer by id ${peerIdStr}`);
        connection = await this.libp2p.dial(peerId);
      } else {
        const encodedMultiAddrs = multiAddrs.map((multiaddr) =>
          multiaddr.encapsulate(`/p2p/${peerIdStr}`),
        );
        console.log(
          "Trying to dial peer by address",
          encodedMultiAddrs.map((multiaddr) => multiaddr.toString()),
        );
        connection = await this.libp2p.dial(encodedMultiAddrs);
      }
      if (isEnabled("CLOSE_INITITIAL_PEER_CONNECTION_ASAP")) {
        connection.close();
      }
      console.log(`Successfully dialed peer ${peerIdStr}`);
      this.callAllListeners(peerIdStr);
      this.peersToDial.delete(peerIdStr);
    } catch (error) {
      peerToDial.isCurrentlyDialing = false;
      if (this.queuedPeersToDialByIds.includes(peerIdStr)) {
        await this.triggerDialFromQueue(peerIdStr);
      }
      console.error(`Failed to dial peer ${peerIdStr}: ${error}`);
    }
  }
}
