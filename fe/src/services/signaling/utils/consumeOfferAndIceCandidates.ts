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

  return new Promise((resolve) => {
    let answer: RTCSessionDescriptionInit | undefined;

    peerConnection.onicecandidate = (event) => {
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
