import type React from "react";
import { useEffect } from "react";
import { webRTCService } from "@/services/WebRTCService";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button.tsx";

const CreateBox: React.FC = () => {
	const state = useCreateBoxStore((state) => state);
	const actions = useCreateBoxStore((state) => state.actions);

	useEffect(() => {
		webRTCService.connectLeader();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

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
