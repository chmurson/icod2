import { logger } from "@icod2/protocols";
import type { PeerId } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import { multiaddr } from "@multiformats/multiaddr";
import type { Libp2p } from "libp2p";
import { getBootstrapMultiaddrs } from "./get-bootstrap-multiaddrs";

interface ReconnectState {
  isReconnecting: boolean;
  retryCount: number;
  retryTimeoutId?: ReturnType<typeof setTimeout>;
}

export class RelayReconnectDialer {
  private libp2p: Libp2p;
  private relayPeerIds: Set<string>;
  private reconnectStates: Map<string, ReconnectState> = new Map();
  private onRelayConnectedListeners: ((peerIdStr: string) => void)[] = [];
  private onRelayDisconnectedListeners: ((peerIdStr: string) => void)[] = [];
  private maxRetries = 5;
  private baseRetryDelay = 1000;
  private maxRetryDelay = 30000;

  constructor(
    libp2p: Libp2p,
    options: {
      onRelayConnected?: (peerIdStr: string) => void;
      onRelayDisconnected?: (peerIdStr: string) => void;
      maxRetries?: number;
      baseRetryDelay?: number;
      maxRetryDelay?: number;
    } = {},
  ) {
    this.libp2p = libp2p;

    const { relayPeerIds } = getBootstrapMultiaddrs();
    this.relayPeerIds = new Set(relayPeerIds);

    if (options.maxRetries !== undefined) {
      this.maxRetries = options.maxRetries;
    }
    if (options.baseRetryDelay !== undefined) {
      this.baseRetryDelay = options.baseRetryDelay;
    }
    if (options.maxRetryDelay !== undefined) {
      this.maxRetryDelay = options.maxRetryDelay;
    }

    if (options.onRelayConnected) {
      this.onRelayConnectedListeners.push(options.onRelayConnected);
    }
    if (options.onRelayDisconnected) {
      this.onRelayDisconnectedListeners.push(options.onRelayDisconnected);
    }

    libp2p.addEventListener("peer:disconnect", this.handlePeerDisconnect);
    libp2p.addEventListener("peer:connect", this.handlePeerConnect);
  }

  addOnRelayConnectedListener(listener: (peerIdStr: string) => void) {
    this.onRelayConnectedListeners.push(listener);
  }

  removeOnRelayConnectedListener(listener: (peerIdStr: string) => void) {
    const index = this.onRelayConnectedListeners.indexOf(listener);
    if (index !== -1) {
      this.onRelayConnectedListeners.splice(index, 1);
    }
  }

  addOnRelayDisconnectedListener(listener: (peerIdStr: string) => void) {
    this.onRelayDisconnectedListeners.push(listener);
  }

  removeOnRelayDisconnectedListener(listener: (peerIdStr: string) => void) {
    const index = this.onRelayDisconnectedListeners.indexOf(listener);
    if (index !== -1) {
      this.onRelayDisconnectedListeners.splice(index, 1);
    }
  }

  [Symbol.dispose]() {
    if (this.libp2p && typeof this.libp2p.removeEventListener === "function") {
      this.libp2p.removeEventListener(
        "peer:disconnect",
        this.handlePeerDisconnect,
      );
      this.libp2p.removeEventListener("peer:connect", this.handlePeerConnect);

      for (const state of this.reconnectStates.values()) {
        if (state.retryTimeoutId) {
          clearTimeout(state.retryTimeoutId);
        }
      }
      this.reconnectStates.clear();
    }
  }

  private handlePeerConnect = (evt: CustomEvent<PeerId>) => {
    const peerIdStr = evt.detail.toString();

    if (!this.relayPeerIds.has(peerIdStr)) {
      return;
    }

    logger.log(`Relay peer connected: ${peerIdStr}`);

    const state = this.reconnectStates.get(peerIdStr);
    if (state?.retryTimeoutId) {
      clearTimeout(state.retryTimeoutId);
    }
    this.reconnectStates.delete(peerIdStr);

    this.notifyRelayConnected(peerIdStr);
  };

  private handlePeerDisconnect = (evt: CustomEvent<PeerId>) => {
    const peerIdStr = evt.detail.toString();

    if (!this.relayPeerIds.has(peerIdStr)) {
      return;
    }

    logger.log(`Relay peer disconnected: ${peerIdStr}`);

    this.notifyRelayDisconnected(peerIdStr);
    this.attemptReconnect(peerIdStr);
  };

  private async attemptReconnect(peerIdStr: string) {
    let state = this.reconnectStates.get(peerIdStr);
    if (state?.isReconnecting) {
      logger.log(`Already attempting to reconnect to relay peer: ${peerIdStr}`);
      return;
    }

    if (!state) {
      state = { isReconnecting: false, retryCount: 0 };
      this.reconnectStates.set(peerIdStr, state);
    }

    state.isReconnecting = true;

    try {
      logger.log(
        `Attempting to reconnect to relay peer: ${peerIdStr} (attempt ${state.retryCount + 1}/${this.maxRetries})`,
      );

      const { bootstrapMultiaddrs } = getBootstrapMultiaddrs();
      const peerMultiaddrs = bootstrapMultiaddrs.filter((addr) =>
        addr.includes(peerIdStr),
      );

      if (peerMultiaddrs.length > 0) {
        logger.log(
          `Dialing relay peer ${peerIdStr} with multiaddrs:`,
          peerMultiaddrs,
        );
        const multiaddrs = peerMultiaddrs.map((addr) => multiaddr(addr));
        await this.libp2p.dial(multiaddrs);
      } else {
        logger.log(`Dialing relay peer ${peerIdStr} by ID`);
        const peerId = peerIdFromString(peerIdStr);
        await this.libp2p.dial(peerId);
      }

      logger.log(`Successfully reconnected to relay peer: ${peerIdStr}`);

      state.isReconnecting = false;
      state.retryCount = 0;
      this.reconnectStates.delete(peerIdStr);
    } catch (error) {
      logger.error(`Failed to reconnect to relay peer ${peerIdStr}:`, error);

      state.isReconnecting = false;
      state.retryCount++;

      if (state.retryCount < this.maxRetries) {
        const delay = this.calculateRetryDelay(state.retryCount);
        logger.log(
          `Scheduling retry for relay peer ${peerIdStr} in ${delay}ms`,
        );

        state.retryTimeoutId = setTimeout(() => {
          this.attemptReconnect(peerIdStr);
        }, delay);
      } else {
        logger.error(
          `Max retries reached for relay peer ${peerIdStr}. Giving up.`,
        );
        this.reconnectStates.delete(peerIdStr);
      }
    }
  }

  private calculateRetryDelay(retryCount: number): number {
    const exponentialDelay = Math.min(
      this.baseRetryDelay * 2 ** (retryCount - 1),
      this.maxRetryDelay,
    );
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(exponentialDelay + jitter);
  }

  private notifyRelayConnected(peerIdStr: string) {
    for (const listener of this.onRelayConnectedListeners) {
      try {
        listener(peerIdStr);
      } catch (error) {
        logger.error("Error in onRelayConnected listener:", error);
      }
    }
  }

  private notifyRelayDisconnected(peerIdStr: string) {
    for (const listener of this.onRelayDisconnectedListeners) {
      try {
        listener(peerIdStr);
      } catch (error) {
        logger.error("Error in onRelayDisconnected listener:", error);
      }
    }
  }
}
