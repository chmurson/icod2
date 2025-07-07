import { Button } from "@/ui/Button";
import { GoBackAlert } from "./GoBackAlert";

export const ClosePageButton = ({
	showAlert,
	onClose,
}: {
	showAlert: boolean;
	onClose: () => void;
}) => {
	if (!showAlert) {
		return (
			<Button variant="secondary" onClick={onClose}>
				Close page
			</Button>
		);
	}

	return (
		<GoBackAlert
			triggerSlot={<Button variant="secondary">Close page</Button>}
			onGoBack={onClose}
		/>
	);
};
