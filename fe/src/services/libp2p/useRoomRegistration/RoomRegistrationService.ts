import { initRoomRegistrationProtocol, loggerGate } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import type { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";

export type RoomRegistrationErrors =
  | "room-registration-unknown-error"
  | "room-registration-timeout"
  | "room-registration-invalid-state";

export interface RoomRegistrationCallbacks {
  onRoomRegistered?: () => void;
  onError?: (error: RoomRegistrationErrors) => void;
}

export class RoomRegistrationService {
  private libp2p?: Libp2p;
  private relayPeerId?: string;
  private roomRegistrationProtocol?: ReturnType<
    typeof initRoomRegistrationProtocol
  >;
  private timeoutHandle?: NodeJS.Timeout;
  private registrationAbortController?: AbortController;
  private peerListeners: Array<() => void> = [];

  private roomTokenProvider: RoomTokenProvider;
  private connectedPeersStorage: ConnectedPeerStorage;
  private callbacks: RoomRegistrationCallbacks = {};
  private timeoutMs = 10_000;

  constructor(
    roomTokenProvider: RoomTokenProvider,
    connectedPeersStorage: ConnectedPeerStorage,
    callbacks: RoomRegistrationCallbacks = {},
    timeoutMs = 10_000,
  ) {
    this.roomTokenProvider = roomTokenProvider;
    this.connectedPeersStorage = connectedPeersStorage;
    this.callbacks = callbacks;
    this.timeoutMs = timeoutMs;
  }

  initialize(libp2p: Libp2p): void {
    this.libp2p = libp2p;
    this.setupPeerListeners();
    this.initializeProtocol();
  }

  updateCallbacks(callback: RoomRegistrationCallbacks): void {
    this.callbacks = callback;
  }

  private setupPeerListeners(): void {
    const onPeerAdded = this.connectedPeersStorage.addListener(
      "peer-added",
      (peerId, peerInfo) => {
        if (peerInfo.isRelay && this.libp2p) {
          this.registerWithRelay(peerId);
        }
      },
    );

    const onPeerRemoved = this.connectedPeersStorage.addListener(
      "peer-removed",
      (peerId) => {
        loggerGate.canLog && console.log("Peer removed:", peerId);
        if (peerId === this.relayPeerId) {
          this.cleanup();
        }
      },
    );

    this.peerListeners.push(onPeerAdded, onPeerRemoved);
  }

  private initializeProtocol(): void {
    if (!this.libp2p) {
      this.callbacks.onError?.("room-registration-invalid-state");
      return;
    }

    this.roomRegistrationProtocol = initRoomRegistrationProtocol(this.libp2p);
    this.registrationAbortController = new AbortController();

    this.roomRegistrationProtocol.start();
  }

  private async registerWithRelay(peerId: string): Promise<void> {
    try {
      this.startTimeout();
      await this.performRegistration(peerId);
    } catch (e) {
      if (!this.registrationAbortController?.signal.aborted) {
        loggerGate.canError && console.error("Error registering room:", e);
        this.callbacks.onError?.("room-registration-unknown-error");
      }
    }
  }

  private async performRegistration(peerId: string): Promise<void> {
    if (!this.roomRegistrationProtocol) return;

    const signal = this.registrationAbortController?.signal;
    if (signal?.aborted) return;

    const connection =
      await this.roomRegistrationProtocol.createPeerConnection(peerId);
    if (signal?.aborted) return;

    const roomToken = this.roomTokenProvider.getRoomToken();
    if (signal?.aborted || !roomToken) return;

    await connection.operations.registerRoom(roomToken);

    this.clearTimeout();
    this.callbacks.onRoomRegistered?.();
  }

  private startTimeout(): void {
    this.clearTimeout();
    this.timeoutHandle = setTimeout(() => {
      loggerGate.canLog && console.log("Timeout reached");
      this.callbacks.onError?.("room-registration-timeout");
      this.cleanup();
    }, this.timeoutMs);
  }

  private clearTimeout(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }

  private cleanup(): void {
    this.registrationAbortController?.abort();
    this.roomRegistrationProtocol?.close();
    this.clearTimeout();
    this.registrationAbortController = undefined;
    this.roomRegistrationProtocol = undefined;
  }

  destroy(): void {
    this.cleanup();
    for (const unsubscribe of this.peerListeners) {
      unsubscribe();
    }
    this.peerListeners = [];
    this.libp2p = undefined;
    this.relayPeerId = undefined;
  }

  // Getters for state inspection
  get isInitialized(): boolean {
    return !!this.libp2p;
  }

  get currentRelayPeerId(): string | undefined {
    return this.relayPeerId;
  }
}
