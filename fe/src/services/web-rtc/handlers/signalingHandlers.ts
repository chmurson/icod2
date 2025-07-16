import type {
  AcknowledgeLeaderMessage,
  IdMessage,
  PeerConnectedMessage,
  PeerDisconnectedMessage,
} from "@icod2/contracts";
import type { WebRTCMessageHandler } from "../types";

export const handleId: WebRTCMessageHandler = (data, ctx) => {
  ctx.myId = (data as IdMessage).id;
  ctx.onId?.(data as IdMessage);
};

export const handleAcknowledgeLeader: WebRTCMessageHandler = (data, ctx) => {
  ctx.onAcknowledgeLeader?.(data as AcknowledgeLeaderMessage);
};

export const handlePeerConnected: WebRTCMessageHandler = async (data, ctx) => {
  await ctx.onPeerConnected?.(data as PeerConnectedMessage);
};

export const handlePeerDisconnected: WebRTCMessageHandler = (data, ctx) => {
  const { peerId } = data as PeerDisconnectedMessage;
  ctx.peerConnections.get(peerId)?.close();
  ctx.peerConnections.delete(peerId);
  ctx.dataChannels.delete(peerId);
  ctx.onPeerDisconnected?.(data as PeerDisconnectedMessage);
};
