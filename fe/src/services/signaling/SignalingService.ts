export interface SignalingService {
  start(): void;
  getToken(): string;
  close(): void;

  get onSignalingServerConnected(): (() => void) | undefined;
  set onSignalingServerConnected(callback: () => void);

  get onPeerConnecting(): (() => void) | undefined;
  set onPeerConnecting(callback: () => void);

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
