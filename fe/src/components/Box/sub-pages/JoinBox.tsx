import type React from "react";
import { useEffect } from "react";
import { webRTCService } from "@/services/WebRTCService";
import { Button } from "@/ui/Button";

const JoinBox: React.FC = () => {
	useEffect(() => {
		webRTCService.connectParticipant();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	return (
		<div>
			<h1>Hi I'm Join Box page</h1>
			<Button variant="primary" onClick={() => {}}>
				Join Box
			</Button>
		</div>
	);
};

export default JoinBox;
