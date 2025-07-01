import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";

const JoinBoxDownload: React.FC = () => {
	const { boxId, handleBackToWelcome } = useBoxStore();
	return (
		<div>
			<h1>Hi I'm Join Box Download page</h1>
			<p>Box ID: {boxId}</p>
			<Button variant="primary" onClick={handleBackToWelcome}>
				Back
			</Button>
		</div>
	);
};

export default JoinBoxDownload;
