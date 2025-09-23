export function shortenPeerId(peerIdStr: string) {
  return `${peerIdStr.slice(0, 2)}...${peerIdStr.slice(-8)}`;
}
