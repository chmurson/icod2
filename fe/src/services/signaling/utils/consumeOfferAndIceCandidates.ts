import { loggerGate } from "@icod2/protocols";
import { getPeerConnectionConfiguration } from "./getPeerConnectionConfiguration";

export function consumeOfferAndIceCandidates(
  payload: {
    offer: RTCSessionDescriptionInit;
    iceCandidates: RTCIceCandidate[];
  },
  peerConnection: RTCPeerConnection,
): Promise<{
  answer: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidate[];
}> {
  const iceCandidates: RTCIceCandidate[] = [];
  let allIceCandidatesSet = false;

  peerConnection.setConfiguration(getPeerConnectionConfiguration());

  return new Promise((resolve) => {
    let answer: RTCSessionDescriptionInit | undefined;

    peerConnection.onicecandidate = (event) => {
      loggerGate.canLog && console.log("ice candidate", event.candidate);

      if (event.candidate !== null) {
        iceCandidates.push(event.candidate);
      }

      if (event.candidate === null) {
        if (answer) {
          resolve({ answer, iceCandidates });
        }
        allIceCandidatesSet = true;
      }
    };

    peerConnection.setRemoteDescription(payload.offer);

    peerConnection
      .createAnswer()
      .then((value) => {
        answer = value;
        return peerConnection.setLocalDescription(value);
      })
      .then(() => {
        if (allIceCandidatesSet && answer) {
          resolve({ answer, iceCandidates });
        }
      });

    payload.iceCandidates.forEach((c) => {
      peerConnection.addIceCandidate(c);
    });
  });
}
