const peerConnection = new RTCPeerConnection();

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

		console.log(payload.iceCandidates);
		payload.iceCandidates.forEach((c) => {
			peerConnection.addIceCandidate(c);
		});
	}).then((value) => console.log("answer payload", JSON.stringify(value)));
}

console.log("Run consumeOfferAndIceCandidates(___) to consumer offer");
