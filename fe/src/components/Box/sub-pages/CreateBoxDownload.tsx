import { DownloadIcon } from "@radix-ui/react-icons";
import { AlertDialog, TextArea } from "@radix-ui/themes";
import { useCallback, useState } from "react";
import { useCreateBoxStore } from "@/stores";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { HiddenTextArea } from "../components/HiddenTextArea";
import { ParticipantItem } from "../components/ParticipantItem";

const CreateBoxDownload: React.FC = () => {
	const { leader, participants, title, treshold } = useCreateBoxState();
	const { hideMessage, showMessage, visibleMessage } =
		useNaiveShowHiddenMessage();
	const resetStateAction = useCreateBoxStore((state) => state.actions.reset);

	const [isDownloadButtonClicked, setIsDownloadButtonClicked] = useState(false);

	const handleClickDownloadButton = () => {
		setIsDownloadButtonClicked(true);
	};

	return (
		<div className="flex flex-col gap-8">
			<Text variant="pageTitle" className="mt-4">
				Box
			</Text>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 items-end">
					<Text variant="label">Name:</Text>
					<Text variant="primaryText">{title}</Text>
				</div>
				<div className="flex gap-2 items-end">
					<Text variant="label">Treshold:</Text>
					<Text variant="primaryText">{treshold}</Text>
				</div>
				<div className="flex flex-col gap-1">
					<Text variant="label">You - leader:</Text>
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</div>
				<div className="flex flex-col gap-1">
					<Text variant="label">Participants:</Text>
					<div>
						{participants.map((p) => (
							<ParticipantItem
								key={p.id}
								name={p.name}
								userAgent={p.userAgent}
							/>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-1">
					<Text variant="label">Preview messae:</Text>
					<HiddenTextArea
						onShow={showMessage}
						onHide={hideMessage}
						value={visibleMessage}
						onChange={(e) => console.log(e.target.value)} // Example onChange
					>
						<TextArea rows={8} disabled />
					</HiddenTextArea>
				</div>
			</div>
			<div className="flex justify-between items-end">
				<Button variant="prominent" onClick={handleClickDownloadButton}>
					<DownloadIcon /> Download box shard
				</Button>
				{JSON.stringify(isDownloadButtonClicked)}
				<ClosePageButton
					showAlert={!isDownloadButtonClicked}
					onClose={resetStateAction}
				/>
			</div>
		</div>
	);
};

const ClosePageButton = ({
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
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<Button variant="secondary">Close page</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content maxWidth="450px">
				<AlertDialog.Title>Box shard is not downloaded</AlertDialog.Title>
				<AlertDialog.Description size="2">
					Are you sure? This application will no longer be accessible, and you
					will lose your chance to download the box shard.
				</AlertDialog.Description>

				<div className="flex justify-between mt-4">
					<AlertDialog.Cancel>
						<Button variant="primary">Upps, cancel</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button variant="secondary" onClick={onClose}>
							Ignore the alert and close the page
						</Button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
};

const useNaiveShowHiddenMessage = () => {
	const message = useCreateBoxStore((state) => state.content);
	const [visibleMessage, setVisisableMessage] = useState("");

	const hideMessage = useCallback(() => {
		setVisisableMessage("");
	}, []);

	const showMessage = useCallback(() => {
		setVisisableMessage(message);
	}, [message]);

	return {
		visibleMessage,
		hideMessage,
		showMessage,
	};
};

const useCreateBoxState = () => {
	const title = useCreateBoxStore((state) => state.title);
	const treshold = useCreateBoxStore((state) => state.threshold);
	const leader = useCreateBoxStore((state) => state.leader);
	const participants = useCreateBoxStore((state) => state.participants);

	return {
		title,
		treshold,
		leader,
		participants,
	};
};

export default CreateBoxDownload;
