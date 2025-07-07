import type React from "react";
import { useEffect } from "react";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import { useDownloadBoxStore, useJoinBoxCreationState } from "@/stores";
import { Button } from "@/ui/Button";

const JoinBox: React.FC = () => {
	const state = useJoinBoxCreationState((state) => state);
	const actions = useJoinBoxCreationState((state) => state.actions);
	const createDownloadStoreFromJoinBox = useDownloadBoxStore(
		(state) => state.fromJoinBox,
	);

	useEffect(() => {
		webRTCService.connectParticipant();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	const handleSimulateJoinCreatedBox = () => {
		actions.create();
		createDownloadStoreFromJoinBox();
	};

	return (
		<div>
			<h1>Hi I'm Join Box page</h1>
			<Button variant="primary" onClick={handleSimulateJoinCreatedBox}>
				Simulate box created
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

export default JoinBox;
