import type React from "react";
import { useJoinBoxCreationState } from "@/stores";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import CreateBox from "./sub-pages/CreateBox";
import CreateBoxDownload from "./sub-pages/CreateBoxDownload";
import JoinBox from "./sub-pages/JoinBox";
import JoinBoxDownload from "./sub-pages/JoinBoxDownload";
import Welcome from "./sub-pages/Welcome";

interface BoxProps {
	/**
	 * Optional additional CSS classes to apply to the box.
	 */
	className?: string;
}

const Box: React.FC<BoxProps> = ({ className }) => {
	const currentPage = useCurrentPage();

	const baseClasses = "p-6 border rounded-lg shadow-sm";
	const combinedClasses = [baseClasses, className].filter(Boolean).join(" ");

	const renderCurrentPage = () => {
		switch (currentPage) {
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

	return <div className={combinedClasses}>{renderCurrentPage()}</div>;
};

const useCurrentPage = () => {
	const {
		connected: createConnected,
		connecting: createConnecting,
		created: createCreated,
	} = useCreateBoxStore();
	const {
		connected: joinConnected,
		connecting: joinConnecting,
		created: joinCreated,
	} = useJoinBoxCreationState();

	if ((createConnected || createConnecting) && !createCreated) {
		return "create";
	}

	if (createCreated) {
		return "createDownload";
	}

	if ((joinConnected || joinConnecting) && !joinCreated) {
		return "join";
	}

	if (joinCreated) {
		return "joinDownload";
	}

	return "welcome";
};

export default Box;
