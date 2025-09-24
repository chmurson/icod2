export type AppConfig = {
  libp2p: {
    listenMultiaddrs: Array<string>;
    announceMultiaddrs: Array<string>;
  };
  logging: LoggingConfig;
};

export type LoggingConfig = {
  level: string;
  axiom?: {
    enabled?: boolean;
    dataset?: string;
    orgId?: string;
    token?: string;
    url?: string;
  };
};
