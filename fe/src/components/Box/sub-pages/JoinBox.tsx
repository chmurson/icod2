import type React from "react";
import { useEffect } from "react";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import { useJoinBoxCreationState } from "@/stores";

const JoinBox: React.FC = () => {
	const { ...state } = useJoinBoxCreationState();

	useEffect(() => {
		webRTCService.connectParticipant();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	return (
		<div>
			<h1>Hi I'm Join Box page</h1>
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
