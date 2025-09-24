export type RouterItem<TPayload, TProto> = (
  peerId: string,
  message: TPayload,
  proto: TProto,
) => void;

export type BasicProtoInterface<BasicMessagePayload> = {
  sendMessageToPeer: (
    peerId: string,
    message: BasicMessagePayload,
  ) => Promise<void>;
  sendMessageToAllPeers: (message: BasicMessagePayload) => Promise<void>;
};
