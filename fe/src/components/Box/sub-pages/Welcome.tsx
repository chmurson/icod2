import type React from "react";
import { useJoinBoxCreationState } from "@/stores";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button";

const Welcome: React.FC = () => {
	const startCreateBox = useCreateBoxStore((state) => state.actions.start);
	const startJoinBox = useJoinBoxCreationState((state) => state.actions.start);

	return (
		<div className="flex flex-col items-center justify-center text-center">
			<h1 className="text-4xl font-bold mb-4">Welcome to iCod2 Box</h1>
			<p className="mb-8 text-lg">
				Securely share files with end-to-end encryption.
			</p>
			<div className="space-x-4 flex gap-12">
				<Button onClick={startCreateBox} variant="prominent">
					Create Box
				</Button>
				<Button variant="prominent" onClick={startJoinBox}>
					Join Box
				</Button>
			</div>
		</div>
	);
};

export default Welcome;
