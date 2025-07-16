export async function createOfferAndAllIceCandidate(
  peerConnection: RTCPeerConnection,
): Promise<{
  offer: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidate[];
}> {
  const iceCandidates: RTCIceCandidate[] = [];
  let allIceCandidatesSet = false;

  return new Promise((resolve) => {
    let offer: RTCSessionDescriptionInit | undefined;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate !== null) {
        iceCandidates.push(event.candidate);
      }
      if (event.candidate === null) {
        if (offer) {
          resolve({ offer, iceCandidates });
        }
        allIceCandidatesSet = true;
      }
    };
    peerConnection
      .createOffer()
      .then((value) => {
        offer = value;
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        if (allIceCandidatesSet && offer) {
          resolve({ offer, iceCandidates });
        }
      });
  });
}

export async function consumeAnswer(
  answerPayload: {
    answer: RTCSessionDescriptionInit;
    iceCandidates: RTCIceCandidate[];
  },
  peerConnection: RTCPeerConnection,
) {
  await peerConnection.setRemoteDescription(answerPayload.answer);
  answerPayload.iceCandidates.forEach((candiate) => {
    peerConnection.addIceCandidate(candiate);
  });
}
