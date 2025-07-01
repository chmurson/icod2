import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";

const Welcome: React.FC = () => {
	const { handleCreateClick, handleJoinClick } = useBoxStore();
	return (
		<div className="flex flex-col items-center justify-center text-center">
			<h1 className="text-4xl font-bold mb-4">Welcome to iCod2 Box</h1>
			<p className="mb-8 text-lg">
				Securely share files with end-to-end encryption.
			</p>
			<div className="space-x-4 flex gap-12">
				<Button onClick={handleCreateClick} variant="prominent">
					Create Box
				</Button>
				<Button variant="prominent" onClick={handleJoinClick}>
					Join Box
				</Button>
			</div>
		</div>
	);
};

export default Welcome;
