export function shortenPeerId(peerIdStr: string) {
  return `${peerIdStr.slice(0, 4)}...${peerIdStr.slice(-4)}`;
}
