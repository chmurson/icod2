import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ComponentsDemo from "./components/ComponentsDemo";
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
					<Link
						to="/webrtc-poc"
						style={{ marginRight: 16, textDecoration: "none" }}
					>
						WebRTC Playground
					</Link>
					<Link to="/components-demo" style={{ textDecoration: "none" }}>
						Components Demo
					</Link>
				</nav>
				<Routes>
					<Route path="/" element={<HelloWorld />} />
					<Route path="/webrtc-poc" element={<WebRTCPlayground />} />
					<Route path="/components-demo" element={<ComponentsDemo />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
