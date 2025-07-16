import { WebSocket } from "ws";
import type { ClientInfo } from "./types";

export class ClientManager {
  private clients = new Map<string, ClientInfo>();

  addClient(clientId: string, ws: WebSocket): void {
    this.clients.set(clientId, { ws, id: "" });
  }

  removeClient(clientId: string): boolean {
    return this.clients.delete(clientId);
  }

  getClient(clientId: string): ClientInfo | undefined {
    return this.clients.get(clientId);
  }

  findClientByWebSocket(ws: WebSocket): [string, ClientInfo] | undefined {
    return Array.from(this.clients.entries()).find(
      ([_id, clientInfo]) => clientInfo.ws === ws,
    );
  }

  updateClient(clientId: string, updates: Partial<ClientInfo>): void {
    const client = this.clients.get(clientId);
    if (client) {
      Object.assign(client, updates);
    }
  }

  broadcastToOthers(senderId: string, message: string): void {
    for (const [clientId, clientInfo] of this.clients.entries()) {
      if (
        clientId !== senderId &&
        clientInfo.ws.readyState === WebSocket.OPEN
      ) {
        clientInfo.ws.send(message);
      }
    }
  }

  sendToClient(clientId: string, message: string): boolean {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
      return true;
    }
    return false;
  }

  getAllClients(): Map<string, ClientInfo> {
    return this.clients;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  isEmpty(): boolean {
    return this.clients.size === 0;
  }
}
