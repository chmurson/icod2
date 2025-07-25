import { createServer, type Server } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import { MatchedSignalingConnectionsProvider } from "./MatchedSignalingConnectionsProvider";
import { SignalingConnection } from "./SignalingConnection";
import { WebsocketJSONHandler } from "./WebSocketJSONHandler";

export class SignalingServer {
  private server: Server;
  private wss: WebSocketServer;
  private websocketsHandlers: WebsocketJSONHandler[] = [];
  private signalingConnections: SignalingConnection[] = [];
  private matchedSignalingConnectinosProvider: MatchedSignalingConnectionsProvider =
    new MatchedSignalingConnectionsProvider();

  constructor(port: number, hostname: string) {
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });

    this.setupWebSocketHandlers();
    this.start(port, hostname);
  }

  private setupWebSocketHandlers(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      const webSocketHandler = new WebsocketJSONHandler(ws);
      const signalingConnection = new SignalingConnection(
        ws,
        this.matchedSignalingConnectinosProvider,
      );
      this.matchedSignalingConnectinosProvider.add(
        signalingConnection.localID,
        signalingConnection,
      );

      this.websocketsHandlers.push(webSocketHandler);
      this.signalingConnections.push(signalingConnection);

      console.log(
        `[SignalingServer] New signaling connection: ${signalingConnection.localID}; Total connections: ${this.signalingConnections.length}`,
      );

      webSocketHandler.onClose(() => {
        const indexOfHandlers = this.websocketsHandlers.findIndex(
          (x) => x === webSocketHandler,
        );

        this.websocketsHandlers.splice(indexOfHandlers, 1);

        const indexOfSignalingConnection = this.signalingConnections.findIndex(
          (x) => x === signalingConnection,
        );

        this.signalingConnections.splice(indexOfSignalingConnection, 1);

        this.matchedSignalingConnectinosProvider.remove(
          signalingConnection.localID,
        );

        console.log(
          `[SignalingServer] Signaling connection got disconnected: ${signalingConnection.localID}; Total connections: ${this.signalingConnections.length}`,
        );

        console.log(
          "Websocket closed. Current number: ",
          this.websocketsHandlers.length,
          "SignalingConnections: ",
          this.signalingConnections.length,
        );
      });

      webSocketHandler.onError((err) => {
        console.error("[WS] WebSocket client error:", err);
      });
    });
  }

  private start(port: number, hostname: string): void {
    this.server.listen({ port, hostname }, () => {
      console.log(`Signaling Server listens on: ws://${hostname}:${port}`);
    });
  }
}
