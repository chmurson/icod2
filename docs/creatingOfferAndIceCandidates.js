const peerConnection = new RTCPeerConnection();

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
			if (event.candidate !== null) {
				iceCandidates.push(event.candidate);
			}
			if (event.candidate === null) {
				resolve({ offer, iceCandidates });
			}
		};
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
	}).then((value) => console.log("offer payload", JSON.stringify(value)));
}

async function consumeAnswer(answerPayload) {
	await peerConnection.setRemoteDescription(answerPayload.answer);
	answerPayload.iceCandidates.forEach((candiate) => {
		peerConnection.addIceCandidate(candiate);
	});
}

console.log("Run createOfferAndAllIceCandidate() to create offer");
console.log("Run consumeAnswer(___) to consumer answer");
