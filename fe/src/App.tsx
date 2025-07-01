import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HelloWorld from "./components/HelloWorld";
import WebRTCPlayground from "./components/WebRTCPlayground";

function App() {
	return (
		<BrowserRouter>
			<div>
				<nav style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
					<Link to="/" style={{ marginRight: 16, textDecoration: "none" }}>
						Home
					</Link>
					<Link to="/webrtc-poc" style={{ textDecoration: "none" }}>
						WebRTC Playground
					</Link>
				</nav>
				<Routes>
					<Route path="/" element={<HelloWorld />} />
					<Route path="/webrtc-poc" element={<WebRTCPlayground />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
