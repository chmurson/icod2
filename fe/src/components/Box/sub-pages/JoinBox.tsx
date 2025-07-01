import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";

const JoinBox: React.FC = () => {
	const { handleJoinBox } = useBoxStore();
	const handleJoin = () => {
		handleJoinBox("example-box-id");
	};

	return (
		<div>
			<h1>Hi I'm Join Box page</h1>
			<Button variant="primary" onClick={handleJoin}>
				Join Box
			</Button>
		</div>
	);
};

export default JoinBox;
