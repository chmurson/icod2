// createing offer and ice candidates script
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: [
        "turn:relay1.expressturn.com:3480"
      ],
      username: "000000002069235043",
      credential: "JfpJZDnXwAcMM/1MWleRFh32PNo=",
    },
  ],
  // iceTransportPolicy: "relay",
});


peerConnection.onconnectionstatechange = async () => {
  console.log("connetion state", peerConnection.connectionState);
  const stats = await peerConnection.getStats()
  stats.forEach(report => {
      if (report.type === "candidate-pair" && report.selected) {
        console.log("🎯  Used candidates pair");
        console.log("📤 local", stats.get(report.localCandidateId));
        console.log("📥 remote", stats.get(report.remoteCandidateId));
      }
    });
};

const dataChannel = peerConnection.createDataChannel("chat");

dataChannel.onopen = () => {
	console.log("Data channel open!");
	dataChannel.send("Hello from Alice!");
};
dataChannel.onmessage = (event) =>
	console.log("Received from Bob:", event.data);

async function createOfferAndAllIceCandidate() {
	const iceCandidates = [];

	return new Promise(async (resolve) => {
		peerConnection.onicecandidate = (event) => {
		  console.log("ice candidate:", event.candidate)

			if (event.candidate !== null) {
				iceCandidates.push(event.candidate);
			}
			if (event.candidate === null) {
				resolve({ offer, iceCandidates });
			}
		};
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
  }).then((value) => {
    console.log("offer payload");
    console.log(JSON.stringify(value, null, 2))
  } );
}

async function consumeAnswer(answerPayload) {
	await peerConnection.setRemoteDescription(answerPayload.answer);
	answerPayload.iceCandidates.forEach((candiate) => {
		peerConnection.addIceCandidate(candiate);
	});
}

console.log("Run createOfferAndAllIceCandidate() to create offer");
console.log("Run consumeAnswer(___) to consumer answer");
