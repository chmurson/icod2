import type {
  SignalingService,
  SignalingServiceConnectionInitiator,
} from "../signaling";

export type PossibleSignalingServie<TConnectionFailReason> =
  | SignalingService
  | (SignalingService &
      SignalingServiceConnectionInitiator<TConnectionFailReason>);

export class DataChannelManager<
  TSignalingService extends PossibleSignalingServie<TConnectionFailReason>,
  TConnectionFailReason = unknown,
> {
  private signalingService: SignalingService;
  private objectIdSet = new Set<{ localID: string }>();

  private callbacks: {
    onConnected?: () => void;
    onFailedToConnect?: (reason: TConnectionFailReason) => void;
    onPeerConnected?: (localID: string) => void;
    onPeerDisconnected?: (localID: string) => void;
    onDataChannelMessage?: (
      localID: string,
      data: object,
      dataChannelManager: DataChannelManager<
        TSignalingService,
        TConnectionFailReason
      >,
    ) => void;
  };

  private peers = new WeakMap<
    { localID: string },
    { connection: RTCPeerConnection; channel: RTCDataChannel }
  >();

  constructor(args: {
    signalingService: TSignalingService;
    callbacks?: {
      onConnected?: () => void;
      onFailedToConnect?: (reason: TConnectionFailReason) => void;
      onPeerConnected?: (localID: string) => void;
      onPeerDisconnected?: (localID: string) => void;
      onDataChannelMessage?: (
        localID: string,
        data: object,
        dataChannelManager: DataChannelManager<
          TSignalingService,
          TConnectionFailReason
        >,
      ) => void;
    };
  }) {
    this.callbacks = args.callbacks ?? {};

    this.signalingService = args.signalingService;

    this.signalingService.onPeerConnected = this.handlePeerConnected.bind(this);

    this.signalingService.onPeerDisconnected =
      this.handlePeerDisconnected.bind(this);

    this.signalingService.onConnected = () => this.callbacks.onConnected?.();

    if ("onFailedToConnect" in this.signalingService) {
      this.signalingService.onFailedToConnect = (
        reason: TConnectionFailReason,
      ) => {
        this.callbacks.onFailedToConnect?.(reason);
      };
    }
  }

  public start() {
    this.signalingService.start();
  }

  public sendMessageToSinglePeer(localId: string, message: object): boolean {
    try {
      const objectId = [...this.objectIdSet].find(
        (id) => id.localID === localId,
      );
      if (!objectId) {
        console.warn(`No peer found with local ID: ${localId}`);
        return false;
      }

      const peer = this.peers.get(objectId);
      if (!peer || peer.channel.readyState !== "open") {
        console.warn(`Data channel for peer ${localId} is not available`);
        return false;
      }

      peer.channel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Failed to send message to peer ${localId}:`, error);
      return false;
    }
  }

  public sendMessageToAllPeers(message: object) {
    this.objectIdSet.forEach((objectId) => {
      const peer = this.peers.get(objectId);
      if (peer && peer.channel.readyState === "open") {
        peer.channel.send(JSON.stringify(message));
      } else {
        console.warn(
          `Data channel for peer ${objectId.localID} is not open. Current state: ${peer?.channel.readyState}`,
        );
      }
    });
  }

  public close() {
    this.signalingService.close();
    this.objectIdSet.clear();
  }

  private handlePeerConnected(
    connection: RTCPeerConnection,
    channel: RTCDataChannel,
  ) {
    const localID = this.createLocalID();
    const objectId = { localID };
    this.objectIdSet.add(objectId);
    this.peers.set(objectId, { connection, channel });

    channel.addEventListener("message", (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          this.callbacks.onDataChannelMessage?.(localID, data, this);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      } else {
        console.warn("Received non-string message:", event.data);
      }
    });

    this.callbacks.onPeerConnected?.(localID);
  }

  private handlePeerDisconnected(connection: RTCPeerConnection) {
    const objectId = [...this.objectIdSet.values()].filter(
      (id) => this.peers.get(id)?.connection === connection,
    )[0];

    if (!objectId) {
      return;
    }

    this.peers.delete(objectId);
    this.objectIdSet.delete(objectId);
    this.callbacks.onPeerDisconnected?.(objectId.localID);
  }
  private createLocalID() {
    return `peer-${Math.random().toString(36).substring(2, 15)}`;
  }
}
