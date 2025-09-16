import type { Libp2p } from "libp2p";
import { attachOngoingStream } from "./commons/attach-ongoing-stream.js";
import { parseJsonSafely } from "./commons/parse-json-safely.js";
import { registerProtoHandle } from "./commons/register-proto-handle.js";

export type PeerMessagePayload = Record<string, unknown>;
export type PeerMessageListener<BasicPayload extends PeerMessagePayload> = (
  fromPeerId: string,
  message: BasicPayload,
  protocol: PeerMessageExchangeProtocol<BasicPayload>,
) => void;

const DEFAULT_PROTOCOL_ID = "/icod2/peer-message-exchange/1.0.0";

type PeerChannel<TPayload extends PeerMessagePayload> = {
  send: (payload: TPayload) => Promise<void>;
  close: () => void;
};

/**
 * Minimal libp2p protocol helper for broadcasting arbitrary peer messages.
 */
export class PeerMessageExchangeProtocol<
  TPeerMessagePayload extends PeerMessagePayload = PeerMessagePayload,
> {
  private libp2p?: Libp2p;
  private readonly protocolId: string;
  private readonly channels = new Map<
    string,
    PeerChannel<TPeerMessagePayload>
  >();
  private listener?: PeerMessageListener<TPeerMessagePayload>;
  private initialized = false;

  constructor({
    protocolId = DEFAULT_PROTOCOL_ID,
    onMessage,
  }: {
    protocolId?: string;
    onMessage?: PeerMessageListener<TPeerMessagePayload>;
  } = {}) {
    this.protocolId = protocolId;
    this.listener = onMessage;
  }

  initialize(libp2p: Libp2p) {
    if (this.initialized) return;

    this.libp2p = libp2p;
    registerProtoHandle(this.protocolId, libp2p, (message, peerId) => {
      const jsonMessage = parseJsonSafely(message);
      if (!jsonMessage) return;
      console.log(
        "Received message from peer:",
        peerId,
        "message:",
        jsonMessage,
      );
      this.listener?.(peerId, jsonMessage as TPeerMessagePayload, this);
    });

    this.initialized = true;
  }

  onMessage(listener: PeerMessageListener<TPeerMessagePayload>) {
    this.listener = listener;
  }

  async sendMessageToPeer(peerId: string, payload: TPeerMessagePayload) {
    const channel = await this.getOrCreateChannel(peerId);
    console.log("Sending message to peer:", peerId, "message:", payload);
    await channel.send(payload);
    console.log("Message sent to peer:", peerId);
  }

  async sendMessageToAllPeers(payload: TPeerMessagePayload) {
    const libp2p = this.requireLibp2p();

    const peerIds = new Set<string>();
    for (const connection of libp2p.getConnections()) {
      peerIds.add(connection.remotePeer.toString());
    }

    for (const knownPeerId of this.channels.keys()) {
      peerIds.add(knownPeerId);
    }

    await Promise.all(
      Array.from(peerIds, (peerId) => this.sendMessageToPeer(peerId, payload)),
    );
  }

  close() {
    if (!this.libp2p) return;

    for (const channel of this.channels.values()) {
      channel.close();
    }
    this.channels.clear();

    this.libp2p.unhandle(this.protocolId);
    this.libp2p = undefined;
    this.initialized = false;
  }

  private async getOrCreateChannel(
    peerId: string,
  ): Promise<PeerChannel<TPeerMessagePayload>> {
    const existing = this.channels.get(peerId);
    if (existing) {
      return existing;
    }

    const libp2p = this.requireLibp2p();
    const { sendJson, getStream } = await attachOngoingStream(
      this.protocolId,
      libp2p,
      peerId,
      (message) => {
        const jsonMessage = parseJsonSafely(message);
        if (!jsonMessage) return;
        console.log(
          "Received message from peer:",
          peerId,
          "message:",
          jsonMessage,
        );
        this.listener?.(peerId, jsonMessage as TPeerMessagePayload, this);
      },
    );

    const peerChannel: PeerChannel<TPeerMessagePayload> = {
      send: (payload) => sendJson(payload),
      close: () => {
        getStream().close();
        this.channels.delete(peerId);
      },
    };

    this.channels.set(peerId, peerChannel);
    return peerChannel;
  }

  private requireLibp2p(): Libp2p {
    if (!this.libp2p) {
      throw new Error("PeerMessageExchangeProtocol is not initialized");
    }

    return this.libp2p;
  }
}
