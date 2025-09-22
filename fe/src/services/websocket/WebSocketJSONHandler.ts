import { loggerGate } from "@icod2/protocols";

export class WebsocketJSONHandler {
  private webSocket: WebSocket;
  private sendingQueue: object[] = [];
  private listeners: {
    onClose: ((code: number, reason: string) => void)[];
    onError: ((error: Event) => void)[];
    onMessage: ((arg: object) => void)[];
    onSpecificMessage: {
      condition: (arg: object) => boolean;
      fn: (arg: object) => void;
    }[];
  } = {
    onClose: [],
    onError: [],
    onMessage: [],
    onSpecificMessage: [],
  };

  private loggingEnabled = false;

  constructor(webSocket: WebSocket, enableLogging = false) {
    this.webSocket = webSocket;
    this.loggingEnabled = enableLogging;

    this.webSocket.addEventListener("open", () => {
      this.handleOpen();
    });

    this.webSocket.addEventListener("message", (event) =>
      this.handleMessage(event),
    );

    this.webSocket.addEventListener("error", (error) =>
      this.handleError(error),
    );

    this.webSocket.addEventListener("close", (event) =>
      this.handleClose(event.code, event.reason),
    );
  }

  public setLogging(enabled: boolean) {
    this.loggingEnabled = enabled;
  }

  getUrl() {
    return this.webSocket.url;
  }

  private warn(message: string, ...args: unknown[]) {
    if (this.loggingEnabled) {
      loggerGate.canWarn && console.warn(message, ...args);
    }
  }

  private error(message: string, ...args: unknown[]) {
    loggerGate.canError && console.error(message, ...args);
  }

  public onClose(fn: (code?: number, reason?: string) => void) {
    this.listeners.onClose.push(fn);
  }

  public onError(fn: (error?: Event) => void) {
    this.listeners.onError.push(fn);
  }

  public onMessage(fn: (payload: object) => void) {
    this.listeners.onMessage.push(fn);
  }

  public onSpecificMessage<T extends object>(
    condition: (payload: object) => payload is T,
    fn: (payload: T) => void,
  ) {
    this.listeners.onSpecificMessage.push({
      condition,
      fn: fn as (payload: object) => void, // I'm using "as" to override TS error :(
    });
  }

  public send(payload: object) {
    if (this.webSocket.readyState === WebSocket.CONNECTING) {
      this.sendingQueue.push(payload);
    } else if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(payload));
    } else {
      this.warn(
        "[WebSocketJSONHandler] WebSocket is closed or cosling. Cannot send message.",
        payload,
      );
    }
  }

  public close() {
    if (
      this.webSocket.readyState === WebSocket.CLOSING ||
      this.webSocket.readyState === WebSocket.CLOSED
    ) {
      this.warn("WebSocket is already closed or not open.");
    } else {
      this.webSocket.close();
    }
  }

  private handleOpen() {
    // Send all queued messages
    while (this.sendingQueue.length > 0) {
      const payload = this.sendingQueue.shift();
      this.webSocket.send(JSON.stringify(payload));
    }
  }

  private handleClose(code: number, reason: string) {
    this.listeners.onClose.forEach((fn) => {
      fn(code, reason);
    });
  }

  private handleError(error: Event) {
    this.listeners.onError.forEach((fn) => {
      fn(error);
    });
  }

  private tryCallSpecificMessageListeners(payload: object) {
    const listenersToExecute = this.listeners.onSpecificMessage.filter(
      (listener) => listener.condition(payload),
    );

    listenersToExecute.forEach((listener) => {
      listener.fn(payload);
    });

    if (
      listenersToExecute.length === 0 &&
      this.listeners.onMessage.length === 0
    ) {
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const json = JSON.parse(event.data);
      this.listeners.onMessage.forEach((fn) => {
        fn(json);
      });
      this.tryCallSpecificMessageListeners(json);
    } catch (e) {
      this.error("Failed to parse JSON message:", e);
    }
  }
}
