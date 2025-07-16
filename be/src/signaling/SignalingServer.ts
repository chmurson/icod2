import { createServer, type Server } from "node:http";
import type {
  AcknowledgeLeaderMessage,
  IdMessage,
  PeerDisconnectedMessage,
  SignalingMessage,
} from "@icod2/contracts";
import { v4 as uuidv4 } from "uuid";
import { type WebSocket, WebSocketServer } from "ws";
import { ClientManager } from "./ClientManager";
import { MessageRouter } from "./MessageRouter";
import { SignalingConnection } from "./SignalingConnection";
import type { HandlerContext } from "./types";
import { WebsocketJSONHandler } from "./WebSocketJSONHandler";

export class SignalingServer {
  private server: Server;
  private wss: WebSocketServer;
  private clientManagerLegacy: ClientManager;
  private messageRouter: MessageRouter;
  private leaderId?: string;
  private leaderName?: string;
  private leaderUserAgent?: string;
  private websocketsHandlers: WebsocketJSONHandler[] = [];
  private signalingConnections: SignalingConnection[] = [];

  constructor(port: number, hostname: string) {
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });
    this.clientManagerLegacy = new ClientManager();
    this.messageRouter = new MessageRouter();

    this.setupWebSocketHandlers();
    this.start(port, hostname);
  }

  private setupWebSocketHandlers(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      const webSocketHandler = new WebsocketJSONHandler(ws);
      const signalingConnection = new SignalingConnection(
        ws,
        this.signalingConnections,
      );

      this.websocketsHandlers.push(webSocketHandler);
      this.signalingConnections.push(signalingConnection);

      webSocketHandler.onClose(() => {
        const indexOfHandlers = this.websocketsHandlers.findIndex(
          (x) => x === webSocketHandler,
        );

        this.websocketsHandlers.splice(indexOfHandlers, 1);

        const indexOfSignalingConnection = this.signalingConnections.findIndex(
          (x) => x === signalingConnection,
        );

        this.signalingConnections.splice(indexOfSignalingConnection, 1);
        this.handleClientDisconnectLegacy(ws);

        console.log(
          "Websocket closed. Current number: ",
          this.websocketsHandlers.length,
          "SignalingConnections: ",
          this.signalingConnections.length,
        );
      });

      webSocketHandler.onMessage((msg) => this.handleLegacyMessage(msg, ws));

      webSocketHandler.onError((err) => {
        console.error("[WS] WebSocket client error:", err);
      });

      this.handleNewConnectionLegacy(ws);
    });
  }

  private handleNewConnectionLegacy(ws: WebSocket) {
    const clientId = uuidv4();
    const idMessage: IdMessage = { type: "id", id: clientId };
    ws.send(JSON.stringify(idMessage));

    // Send leader info if exists
    if (this.leaderId) {
      const leaderMessage: AcknowledgeLeaderMessage = {
        type: "acknowledgeLeader",
        leaderId: this.leaderId,
        leaderName: this.leaderName || "",
        leaderUserAgent: this.leaderUserAgent || "",
      };
      ws.send(JSON.stringify(leaderMessage));
    }

    // Set as leader if first client
    if (this.clientManagerLegacy.isEmpty()) {
      this.leaderId = clientId;
    }

    // Add client to manager
    this.clientManagerLegacy.addClient(clientId, ws);
    console.log(
      "[WS] New client connected. Total clients:",
      this.clientManagerLegacy.getClientCount(),
    );

    ws.on("close", () => {
      this.handleClientDisconnectLegacy(ws);
    });
  }

  private handleLegacyMessage(message: object, ws: WebSocket): void {
    const data: SignalingMessage = message as SignalingMessage;

    console.log("[WS] Relaying message of type", data.type);

    const currentClientInfo =
      this.clientManagerLegacy.findClientByWebSocket(ws);
    if (!currentClientInfo) {
      console.warn("[WS] Message from unknown client.");
      return;
    }
    const [senderId, senderInfo] = currentClientInfo;

    const context: HandlerContext = {
      clients: this.clientManagerLegacy,
      wss: this.wss,
      leaderId: this.leaderId,
      leaderName: this.leaderName,
      leaderUserAgent: this.leaderUserAgent,
      updateLeaderInfo: (name: string, userAgent: string) => {
        this.leaderName = name;
        this.leaderUserAgent = userAgent;
      },
    };

    this.messageRouter.routeMessage(data, senderInfo, senderId, context);
  }

  private handleClientDisconnectLegacy(ws: WebSocket): void {
    const currentClientInfo =
      this.clientManagerLegacy.findClientByWebSocket(ws);
    if (currentClientInfo) {
      const [disconnectedClientId] = currentClientInfo;
      this.clientManagerLegacy.removeClient(disconnectedClientId);

      console.log(
        `[WS] Client ${disconnectedClientId} disconnected. Total clients:`,
        this.clientManagerLegacy.getClientCount(),
      );

      // Notify other clients about the disconnection
      const disconnectMessage: PeerDisconnectedMessage = {
        type: "peerDisconnected",
        peerId: disconnectedClientId,
      };

      this.clientManagerLegacy.broadcastToOthers(
        disconnectedClientId,
        JSON.stringify(disconnectMessage),
      );

      if (this.leaderId === disconnectedClientId) {
        this.leaderId = undefined;
        this.leaderName = undefined;
        this.leaderUserAgent = undefined;
      }
    } else {
      console.log(
        "[WS] Unknown client disconnected. Total clients:",
        this.clientManagerLegacy.getClientCount(),
      );
    }
  }

  private start(port: number, hostname: string): void {
    this.server.listen({ port, hostname }, () => {
      console.log(`Signaling Server listens on: ws://${hostname}:${port}`);
    });
  }
}
