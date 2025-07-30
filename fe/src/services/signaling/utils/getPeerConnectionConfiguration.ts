export function getPeerConnectionConfiguration() {
  return {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: ["turn:relay1.expressturn.com:3480"],
        username: "000000002069235043",
        credential: "JfpJZDnXwAcMM/1MWleRFh32PNo=",
      },
    ],
  } satisfies RTCConfiguration;
}
