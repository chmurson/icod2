// consuming offer and ice candidates script
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

peerConnection.ondatachannel = (event) => {
	const dataChannel = event.channel;
	dataChannel.onopen = () => console.log("Data channel open!");
	dataChannel.onmessage = (event) =>
		console.log("Received from Alice:", event.data);

	// (Optional) Send a message to Alice
	dataChannel.send("Hello from Bob!");
};

async function consumeOfferAndIceCandidates(payload) {
	const iceCandidates = [];

	return new Promise(async (resolve, reject) => {
		let answer;

		peerConnection.onicecandidate = (event) => {
		  console.log("ice candidate:", event.candidate)

			if (event.candidate !== null) {
				iceCandidates.push(event.candidate);
			}
			if (event.candidate === null) {
				resolve({ answer, iceCandidates });
			}
		};

		peerConnection.setRemoteDescription(payload.offer);

		answer = await peerConnection.createAnswer();
		peerConnection.setLocalDescription(answer);

		console.log("ice candidates in the offer: ",payload.iceCandidates);
		payload.iceCandidates.forEach((c) => {
			peerConnection.addIceCandidate(c);
		});
  }).then((value) => {
    console.log("answer payload")
    console.log(JSON.stringify(value, null, 2))
  });
}

console.log("Run consumeOfferAndIceCandidates(___) to consumer offer");
