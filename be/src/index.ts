import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface ClientInfo {
  ws: WebSocket;
  id: string;
  userAgent?: string;
  device?: string;
  name?: string;
}

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map<string, ClientInfo>();
let leaderId: string
let leaderUserAgent: string

wss.on('connection', (ws) => {
  const clientId = uuidv4();

  if (clients.size === 0) {
    leaderId = clientId
  }

  clients.set(clientId, { ws, id: '' }); // Initialize with empty id

  console.log('[WS] New client connected. Total clients:', clients.size);
  ws.send(JSON.stringify({ type: 'id', id: clientId }));

  if (leaderId) {
      ws.send(JSON.stringify({ type: 'acknowledgeLeader', leaderId, leaderName: 'John Doe', leaderDevice: 'desktop',  leaderUserAgent }));
  }

  ws.on('message', (message) => {
    let messageText: string;
    if (typeof message === 'string') {
      messageText = message;
    } else if (message instanceof Buffer) {
      messageText = message.toString();
    } else {
      console.warn('[WS] Unknown message data type:', message);
      return;
    }
    
    let data;
    try {
      data = JSON.parse(messageText);
    } catch {
      console.warn('[WS] Invalid JSON:', messageText);
      return;
    }
    
    console.log('[WS] Relaying message of type', data.type);

    const currentClientInfo = Array.from(clients.entries()).find(([id, clientInfo]) => clientInfo.ws === ws);
    if (!currentClientInfo) {
      console.warn('[WS] Message from unknown client.');
      return;
    }
    const [senderId, senderInfo] = currentClientInfo;

    if (data.type === 'greeting') {
      senderInfo.id = data.id;
      senderInfo.userAgent = data.id;

      if (senderInfo.id === leaderId && !leaderUserAgent) {
        leaderUserAgent = senderInfo.userAgent ?? ''
      }

      // Notify all other clients about the new client
      for (const [clientId, clientInfo] of clients.entries()) {
        if (clientId !== senderId && clientInfo.ws.readyState === WebSocket.OPEN) {
          console.log('notifying clients about new client, peerId is', senderId)
          clientInfo.ws.send(JSON.stringify({ type: 'peerConnected', peerId: senderId, userAgent: senderInfo.userAgent }));
        }
      }

      // Notify the new client about all existing clients
      for (const [clientId, clientInfo] of clients.entries()) {
        if (clientId !== senderId && clientInfo.ws.readyState === WebSocket.OPEN && clientInfo.id) {
          console.log('notifying new client about clients', clientId)
          ws.send(JSON.stringify({ type: 'peerConnected', peerId: clientId, userAgent: clientInfo.userAgent }));
        }
      }
    } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate' || data.type === 'chatMessage') {
      const targetClientInfo = clients.get(data.targetId);
      if (targetClientInfo && targetClientInfo.ws.readyState === WebSocket.OPEN) {
        // Add senderId to the message before relaying
        const messageToRelay = { ...data, senderId: senderId };
        targetClientInfo.ws.send(JSON.stringify(messageToRelay));
      } else {
        console.warn(`[WS] Target client ${data.targetId} not found or not open.`);
      }
    } else {
      console.warn('[WS] Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    let disconnectedClientId: string | undefined;
    for (const [clientId, clientInfo] of clients.entries()) {
      if (clientInfo.ws === ws) {
        disconnectedClientId = clientId;
        clients.delete(clientId);
        break;
      }
    }
    if (disconnectedClientId) {
      console.log(`[WS] Client ${disconnectedClientId} disconnected. Total clients:`, clients.size);
      // Notify other clients about the disconnection
      for (const [clientId, clientInfo] of clients.entries()) {
        if (clientInfo.ws.readyState === WebSocket.OPEN) {
          clientInfo.ws.send(JSON.stringify({ type: 'peerDisconnected', peerId: disconnectedClientId }));
        }
      }
    } else {
      console.log('[WS] Unknown client disconnected. Total clients:', clients.size);
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] WebSocket client error:', err);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[WS] WebSocket signaling server running on port ${PORT}`);
});
