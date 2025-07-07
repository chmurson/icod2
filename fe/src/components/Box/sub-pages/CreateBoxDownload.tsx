import { TextArea } from "@radix-ui/themes";
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
			<div>
				<Button variant="prominent">Download box shard</Button>
			</div>
		</div>
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
