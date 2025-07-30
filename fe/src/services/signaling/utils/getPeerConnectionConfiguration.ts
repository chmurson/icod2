export function getPeerConnectionConfiguration() {
  return {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "5473994f7ccf9325b581d163",
        credential: "c2yQiiEkiUea8ExJ",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "5473994f7ccf9325b581d163",
        credential: "c2yQiiEkiUea8ExJ",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "5473994f7ccf9325b581d163",
        credential: "c2yQiiEkiUea8ExJ",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "5473994f7ccf9325b581d163",
        credential: "c2yQiiEkiUea8ExJ",
      },
    ],
    iceTransportPolicy: "relay",
  } satisfies RTCConfiguration;
}
