import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ComponentsDemo from "./components/ComponentsDemo";
import HelloWorld from "./components/HelloWorld";
import WebRTCPlayground from "./components/WebRTCPlayground";

function useSystemTheme() {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		// Check initial system preference
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		setTheme(mediaQuery.matches ? "dark" : "light");

		// Listen for changes to system preference
		const handleChange = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handleChange);

		// Cleanup listener on unmount
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return theme;
}

function App() {
	const theme = useSystemTheme();

	return (
		<Theme
			accentColor="plum"
			appearance={theme}
			grayColor="gray"
			panelBackground="translucent"
			scaling="100%"
			radius="full"
		>
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
		</Theme>
	);
}

export default App;
