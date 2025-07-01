import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button.tsx";

const CreateBox: React.FC = () => {
	const { handleBoxCreated } = useBoxStore();
	const handleCreateBox = () => {
		const newBoxId = "example-box-id";
		handleBoxCreated(newBoxId);
	};

	return (
		<div>
			<h1>Hi I'm Create Box page</h1>
			<Button variant="primary" onClick={handleCreateBox}>
				Create Box
			</Button>
		</div>
	);
};

export default CreateBox;
