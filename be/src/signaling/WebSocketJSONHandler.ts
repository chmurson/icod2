import type { RawData, WebSocket } from "ws";

export class WebsocketJSONHandler {
  private listeners: {
    onClose: ((code: number, reason: Buffer) => void)[];
    onError: ((error: Error) => void)[];
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

  constructor(
    private readonly webSocket: WebSocket,
    enableLogging = false,
  ) {
    this.loggingEnabled = enableLogging;
    this.webSocket.on("message", (data, isBinary) =>
      this.handleMessage(data, isBinary),
    );
    this.webSocket.on("error", (error) => this.handleError(error));
    this.webSocket.on("close", (code, reason) =>
      this.handleClose(code, reason),
    );
  }

  public setLogging(enabled: boolean) {
    this.loggingEnabled = enabled;
  }

  private log(message: string, ...args: unknown[]) {
    if (this.loggingEnabled) {
      console.log(message, ...args);
    }
  }

  private warn(message: string, ...args: unknown[]) {
    if (this.loggingEnabled) {
      console.warn(message, ...args);
    }
  }

  private error(message: string, ...args: unknown[]) {
    if (this.loggingEnabled) {
      console.error(message, ...args);
    }
  }

  public onClose(fn: (code?: number, buffer?: Buffer) => void) {
    this.listeners.onClose.push(fn);
  }

  public onError(fn: (error?: Error) => void) {
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
    this.webSocket.send(JSON.stringify(payload));
  }

  private handleClose(code: number, reason: Buffer) {
    this.listeners.onClose.forEach((fn) => fn(code, reason));
  }

  private handleError(error: Error) {
    this.listeners.onError.forEach((fn) => fn(error));
  }

  private tryCallSpecificMessageListeners(payload: object) {
    const listenersToExecute = this.listeners.onSpecificMessage.filter(
      (listener) => listener.condition(payload),
    );

    listenersToExecute.forEach((listener) => listener.fn(payload));

    if (
      listenersToExecute.length === 0 &&
      this.listeners.onMessage.length === 0
    ) {
      this.warn("[WebsocketJSONHandler] No listener to execute for: ", payload);
    }
  }

  private handleMessage(data: RawData, isBinary: boolean) {
    if (isBinary) {
      return this.error("Binary message are not supported");
    }

    if (typeof data === "string") {
      try {
        const json = JSON.parse(data);
        this.listeners.onMessage.forEach((fn) => fn(json));
        this.tryCallSpecificMessageListeners(json);
      } catch (e) {
        this.error("Failed to parse JSON message:", e);
      }
      return;
    }

    if (data instanceof Buffer) {
      try {
        const string = data.toString();
        const json = JSON.parse(string);
        this.listeners.onMessage.forEach((fn) => fn(json));
        this.tryCallSpecificMessageListeners(json);
      } catch (e) {
        this.error("Failed to parse JSON message:", e);
      }
      return;
    }

    this.error("Message not handled; type:", typeof data, "; data:", data);
  }
}
