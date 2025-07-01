import { Link } from "react-router-dom";

function HelloWorld() {
	return (
		<div style={{ padding: 24 }}>
			<h1>Hello World!</h1>
			<p>Welcome to the ICOD2 frontend application.</p>
			<p>
				Navigate to <Link to="/webrtc-poc">/webrtc-poc</Link> to see the WebRTC
				playground.
			</p>
		</div>
	);
}

export default HelloWorld;
