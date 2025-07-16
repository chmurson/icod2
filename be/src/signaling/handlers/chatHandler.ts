import type { MessageHandler } from "../types";

function hasTargetId(data: unknown): data is { targetId: string } {
  return typeof data === "object" && data !== null && "targetId" in data;
}

export const handleChatMessage: MessageHandler = (data, senderId, context) => {
  if (!hasTargetId(data)) {
    throw new Error("handleChatMessage called with message lacking targetId");
  }
  context.clients.sendToClient(
    data.targetId,
    JSON.stringify({ ...data, senderId }),
  );
};
