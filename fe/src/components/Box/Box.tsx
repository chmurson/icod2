import type React from "react";
import { useJoinBoxCreationState } from "@/stores";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import CreateBox from "./sub-pages/CreateBox";
import CreateBoxDownload from "./sub-pages/CreateBoxDownload";
import JoinBox from "./sub-pages/JoinBox";
import JoinBoxDownload from "./sub-pages/JoinBoxDownload";
import Welcome from "./sub-pages/Welcome";
import { WhatsYourName } from "./sub-pages/WhatsYourName";

interface BoxProps {
	/**
	 * Optional additional CSS classes to apply to the box.
	 */
	className?: string;
}

const Box: React.FC<BoxProps> = () => {
	const currentPage = useCurrentPage();

	const renderCurrentPage = () => {
		switch (currentPage) {
			case "createBoxSetName":
				return <WhatsYourName create />;
			case "joinBoxSetName":
				return <WhatsYourName join />;
			case "welcome":
				return <Welcome />;
			case "create":
				return <CreateBox />;
			case "join":
				return <JoinBox />;
			case "createDownload":
				return <CreateBoxDownload />;
			case "joinDownload":
				return <JoinBoxDownload />;
			default:
				return <Welcome />;
		}
	};

	return renderCurrentPage();
};

const useCurrentPage = () => {
	const { state: createBoxState } = useCreateBoxStore();
	const { state: joinBoxState } = useJoinBoxCreationState();

	console.log(createBoxState);

	if (createBoxState === "set-name") {
		return "createBoxSetName";
	}

	if (createBoxState === "connected" || createBoxState === "connecting") {
		return "create";
	}

	if (createBoxState === "created") {
		return "createDownload";
	}

	if (joinBoxState === "set-name") {
		return "joinBoxSetName";
	}

	if (joinBoxState === "connecting" || joinBoxState === "connected") {
		return "join";
	}

	if (joinBoxState === "created") {
		return "joinDownload";
	}

	return "welcome";
};

export default Box;
