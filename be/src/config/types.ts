export type AppConfig = {
  libp2p: {
    listenMultiaddrs: Array<string>;
    announceMultiaddrs: Array<string>;
  };
  logging: {
    level: string;
  };
};
