import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";

const CreateBoxDownload: React.FC = () => {
	const { boxId, handleBackToWelcome } = useBoxStore();
	return (
		<div>
			<h1>Hi I'm Create Box Download page</h1>
			<p>Box ID: {boxId}</p>
			<Button variant="primary" onClick={handleBackToWelcome}>
				Back
			</Button>
		</div>
	);
};

export default CreateBoxDownload;
