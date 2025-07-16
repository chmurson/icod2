import type { RawData, WebSocket } from "ws";

export class WebsocketHandler {
  private listeners: {
    onClose: ((code: number, reason: Buffer) => void)[];
    onError: ((error: Error) => void)[];
    onMessage: ((arg: object) => void)[];
  } = {
    onClose: [],
    onError: [],
    onMessage: [],
  };

  constructor(private readonly webSocket: WebSocket) {
    this.webSocket.on("message", (data, isBinary) =>
      this.handleMessage(data, isBinary),
    );
    this.webSocket.on("error", (error) => this.handleError(error));
    this.webSocket.on("close", (code, reason) =>
      this.handleClose(code, reason),
    );
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

  private handleClose(code: number, reason: Buffer) {
    this.listeners.onClose.forEach((fn) => fn(code, reason));
  }

  private handleError(error: Error) {
    this.listeners.onError.forEach((fn) => fn(error));
  }

  private handleMessage(data: RawData, isBinary: boolean) {
    if (isBinary) {
      return console.error("Binary message are not supported");
    }

    if (typeof data === "string") {
      try {
        const json = JSON.parse(data);
        this.listeners.onMessage.forEach((fn) => fn(json));
      } catch (e) {
        console.error(e);
      }
      return;
    }

    if (data instanceof Buffer) {
      try {
        const string = data.toString();
        const json = JSON.parse(string);
        this.listeners.onMessage.forEach((fn) => fn(json));
      } catch (e) {
        console.error(e);
      }
      return;
    }

    console.error("Message not handled; type:", typeof data, "; data:", data);
  }
}
