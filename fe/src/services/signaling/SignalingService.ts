export interface SignalingService {
  start(): void;
  getToken(): string;
  close(): void;

  get onConnected(): (() => void) | undefined;
  set onConnected(callback: () => void);

  get onPeerConnected():
    | ((peerConnection: RTCPeerConnection, dataChannel: RTCDataChannel) => void)
    | undefined;
  set onPeerConnected(callback: (
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel,
  ) => void);

  get onPeerDisconnected():
    | ((peerConnection: RTCPeerConnection) => void)
    | undefined;
  set onPeerDisconnected(callback: (peerConnection: RTCPeerConnection) => void);
}

export interface SignalingServiceConnectionInitiator<T> {
  get onFailedToConnect(): ((reason: T) => void) | undefined;
  set onFailedToConnect(callback: (reason: T) => void);
}
