export class WebsocketJSONHandler {
  private webSocket: WebSocket;
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

  private isOpen = false;

  constructor(webSocket: WebSocket) {
    this.webSocket = webSocket;

    this.webSocket.addEventListener("open", () => this.handleOpen());

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

  public onClose(fn: (code?: number, reason?: string) => void) {
    this.isOpen = false;
    this.listeners.onClose.push(fn);
  }

  public onError(fn: (error?: Event) => void) {
    this.listeners.onError.push(fn);
  }

  public onMessage(fn: (payload: object) => void) {
    if (!this.isOpen) {
      throw new Error("WebSocket connection is not open");
    }
    this.listeners.onMessage.push(fn);
  }

  public onSpecificMessage<T extends object>(
    condition: (payload: object) => payload is T,
    fn: (payload: T) => void,
  ) {
    if (!this.isOpen) {
      throw new Error("WebSocket connection is not open");
    }
    this.listeners.onSpecificMessage.push({
      condition,
      fn: fn as (payload: object) => void, // I'm using "as" to override TS error :(
    });
  }

  public send(payload: object) {
    if (!this.isOpen) {
      throw new Error("WebSocket connection is not open");
    }
    this.webSocket.send(JSON.stringify(payload));
  }

  public close() {
    if (this.isOpen) {
      this.webSocket.close();
      this.isOpen = false;
    } else {
      console.warn("WebSocket is already closed or not open.");
    }
  }

  private handleOpen() {
    this.isOpen = true;
  }

  private handleClose(code: number, reason: string) {
    this.isOpen = false;
    this.listeners.onClose.forEach((fn) => fn(code, reason));
  }

  private handleError(error: Event) {
    this.listeners.onError.forEach((fn) => fn(error));
  }

  private tryCallSpecificMessageListeners(payload: object) {
    const listenersToExecute = this.listeners.onSpecificMessage.filter(
      (listener) => listener.condition(payload),
    );

    listenersToExecute.forEach((listener) => listener.fn(payload));

    if (listenersToExecute.length === 0) {
      console.warn("[Debug] No listener to execute for: ", payload);
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const json = JSON.parse(event.data);
      this.listeners.onMessage.forEach((fn) => fn(json));
      this.tryCallSpecificMessageListeners(json);
    } catch (e) {
      console.error("Failed to parse JSON message:", e);
    }
  }
}
