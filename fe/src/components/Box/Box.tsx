import type React from "react";
import { useBoxStore } from "@/stores/boxStore";
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

/**
 * A box component for secure file sharing with multiple sub-pages.
 * Manages internal state to control which sub-page is visible.
 */
const Box: React.FC<BoxProps> = ({ className }) => {
	const { currentPage } = useBoxStore();

	const baseClasses = "p-6 border rounded-lg shadow-sm bg-white";
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

export default Box;
