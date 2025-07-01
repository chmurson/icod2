import type React from "react";
import { useEffect } from "react";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button.tsx";

const CreateBox: React.FC = () => {
	const state = useCreateBoxStore((state) => state);
	const actions = useCreateBoxStore((state) => state.actions);

	useEffect(() => {
		const timeouts = [
			!state.connected &&
				setTimeout(() => {
					actions.connectLeader({
						device: "desktop",
						id: "12345",
						name: "Wojciech",
						userAgent: navigator.userAgent,
					});
				}, 1000),

			state.connected &&
				setTimeout(() => {
					actions.connectParticiapnt({
						device: "mobile",
						id: "12346",
						name: "Buzz",
						userAgent: "Chrome",
					});
				}, 2500),

			state.connected &&
				setTimeout(() => {
					actions.connectParticiapnt({
						device: "tablet",
						id: "12349",
						name: "Christ",
						userAgent: "Safari",
					});
				}, 3500),
		];

		return () => {
			timeouts
				.filter((x) => typeof x !== "boolean")
				.forEach((timeout) => clearTimeout(timeout));
		};
	}, [actions, state.connected]);

	return (
		<div>
			<h1>Hi I'm Create Box page</h1>
			<Button variant="primary" onClick={actions.create}>
				Create Box
			</Button>
			<PrettyJson>{state}</PrettyJson>
		</div>
	);
};

const PrettyJson: React.FC<{ children: object }> = ({ children }) => {
	return (
		<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
			{JSON.stringify(children, null, 2)}
		</pre>
	);
};

export default CreateBox;
