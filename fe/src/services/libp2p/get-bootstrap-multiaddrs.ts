export function getBootstrapMultiaddrs(): {
  bootstrapMultiaddrs: string[];
  relayPeerIds: string[];
} {
  const browserMultiaddrsOverride = window.icod2Dev.bootstrapMultiaddr.get();

  const bootstrapMultiaddrs = [
    ...(browserMultiaddrsOverride ?? []),
    ...(import.meta.env.VITE_BOOTSTRAP_MULTIADDRS?.split(",") ?? []),
  ];

  const relayPeerIds = bootstrapMultiaddrs
    .filter(isString)
    .map((multiaddr: string) => multiaddr.split("/").at(-1) ?? "");

  return {
    bootstrapMultiaddrs,
    relayPeerIds,
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
