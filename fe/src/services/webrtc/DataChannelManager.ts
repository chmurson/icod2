import { logger } from "@icod2/protocols";
import { generateNiceRandomToken } from "@/utils/generateNiceRandomToken";
import type {
  SignalingService,
  SignalingServiceConnectionInitiator,
} from "../signaling";
import type { DataChannelMessageRouter } from "./DataChannelMessageRouter";

export type PossibleSignalingServie<TConnectionFailReason> =
  | SignalingService
  | (SignalingService &
      SignalingServiceConnectionInitiator<TConnectionFailReason>);

export class DataChannelManager<
  TSignalingService extends
    PossibleSignalingServie<TConnectionFailReason> = SignalingService,
  TConnectionFailReason = unknown,
> {
  private signalingService: SignalingService;
  private objectIdSet = new Set<{ localID: string }>();

  private callbacks: {
    onSignalingServerConnected?: () => void;
    onFailedToConnect?: (reason: TConnectionFailReason) => void;
    onPeerConnected?: (localID: string) => void;
    onPeerConnecting?: () => void;
    onPeerDisconnected?: (localID: string) => void;
    onDataChannelMessage?:
      | ((
          localID: string,
          data: object,
          dataChannelManager: DataChannelManager<
            TSignalingService,
            TConnectionFailReason
          >,
        ) => void)
      | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>;
  };

  private peers = new WeakMap<
    { localID: string },
    { connection: RTCPeerConnection; channel: RTCDataChannel }
  >();

  constructor(args: {
    signalingService: TSignalingService;
    callbacks?: {
      onSignalingServerConnected?: () => void;
      onFailedToConnect?: (reason: TConnectionFailReason) => void;
      onPeerConnecting?: () => void;
      onPeerConnected?: (localID: string) => void;
      onPeerDisconnected?: (localID: string) => void;
      onDataChannelMessage?:
        | ((
            localID: string,
            data: object,
            dataChannelManager: DataChannelManager<
              TSignalingService,
              TConnectionFailReason
            >,
          ) => void)
        | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>;
    };
  }) {
    this.callbacks = args.callbacks ?? {};

    this.signalingService = args.signalingService;

    this.signalingService.onPeerConnected = this.handlePeerConnected.bind(this);

    if (this.callbacks.onPeerConnecting) {
      this.signalingService.onPeerConnecting = this.callbacks.onPeerConnecting;
    }

    this.signalingService.onPeerDisconnected =
      this.handlePeerDisconnected.bind(this);

    this.signalingService.onSignalingServerConnected = () =>
      this.callbacks.onSignalingServerConnected?.();

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
        logger.warn(`No peer found with local ID: ${localId}`);
        this.callbacks.onPeerDisconnected?.(localId);
        return false;
      }

      const peer = this.peers.get(objectId);
      if (!peer || peer.channel.readyState !== "open") {
        logger.warn(`Data channel for peer ${localId} is not available`);
        return false;
      }

      logger.log(
        `Sending message ${"type" in message ? message.type : JSON.stringify(message)} to peer ${localId}`,
      );
      peer.channel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to peer ${localId}:`, error);
      return false;
    }
  }

  public sendMessageToAllPeers(message: object) {
    this.objectIdSet.forEach((objectId) => {
      const peer = this.peers.get(objectId);
      if (peer && peer.channel.readyState === "open") {
        logger.log(
          `Sending message ${"type" in message ? message.type : JSON.stringify(message)} to peer ${objectId.localID}`,
        );
        peer.channel.send(JSON.stringify(message));
      } else {
        logger.warn(
          `Data channel for peer ${objectId.localID} is not open. Current state: ${peer?.channel.readyState}`,
        );
      }
    });
  }

  public disconnectPeer(peerId: string) {
    const objectId = Object.values(this.objectIdSet).find(
      (objectId) => objectId.localID === peerId,
    );
    if (!objectId) {
      logger.warn(
        `Cannot disconnect peer with id:${peerId} because it seems it's not connected`,
      );
    }
    const peer = this.peers.get(objectId);

    if (!peer) {
      logger.warn(
        `Cannot disconnect peer with id:${peerId} because, although an object ID was found, no corresponding peer connection data exists.`,
      );
    }

    peer?.channel.close();
    peer?.connection.close();
    this.peers.delete(objectId);
    this.objectIdSet.delete(objectId);
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
          const { onDataChannelMessage } = this.callbacks;
          if (!onDataChannelMessage) {
            return;
          }

          if ("router" in onDataChannelMessage) {
            onDataChannelMessage?.router(localID, data, this);
          } else if (typeof onDataChannelMessage === "function") {
            onDataChannelMessage?.(localID, data, this);
          }
        } catch (error) {
          logger.error("Failed to parse message:", error);
        }
      } else {
        logger.warn("Received non-string message:", event.data);
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
    return `peer-${generateNiceRandomToken()}`;
  }
}
