import { WebsocketJSONHandler } from "./WebSocketJSONHandler";

const port = import.meta.env.VITE_SIGNALING_PORT;
const hosname = import.meta.env.VITE_SIGNALING_HOSTNAME;
const url = `ws://${hosname}:${port}`;

export function createWebsocketConnection({
  enableLogging = false,
}: {
  enableLogging?: boolean;
} = {}) {
  return new WebsocketJSONHandler(new WebSocket(url), enableLogging);
}
