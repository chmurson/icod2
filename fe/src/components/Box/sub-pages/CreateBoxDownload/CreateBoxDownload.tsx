import { DownloadIcon } from "@radix-ui/react-icons";
import { TextArea } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react"; // Added useEffect
import { useBlocker, useNavigate } from "react-router-dom"; // Added useBlocker, useNavigate
import { useCreateBoxStore } from "@/stores";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { HiddenTextArea } from "../../components/HiddenTextArea";
import { ParticipantItem } from "../../components/ParticipantItem";
import { ClosePageButton, GoBackAlert } from "./components";
import { useCreateBoxDownloadState } from "./hooks";
import { useNaiveShowHiddenMessage } from "./hooks/useNaiveShowHiddenMessage";

export const CreateBoxDownload: React.FC = () => {
	const { leader, participants, title, treshold } = useCreateBoxDownloadState();

	const { hideMessage, showMessage, visibleMessage } =
		useNaiveShowHiddenMessage();

	const resetStoreStateAction = useCreateBoxStore(
		(state) => state.actions.reset,
	);

	const navigate = useNavigate();

	const [isDownloadButtonClicked, setIsDownloadButtonClicked] = useState(false);

	const handleClickDownloadButton = () => {
		setIsDownloadButtonClicked(true);
	};

	const resetAndNavigateAway = useCallback(() => {
		resetStoreStateAction();
		navigate("/");
	}, [resetStoreStateAction, navigate]);

	const shouldNavigationBeBlocked = useCallback(
		() => !isDownloadButtonClicked,
		[isDownloadButtonClicked],
	);

	const blocker = useBlocker(shouldNavigationBeBlocked);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isDownloadButtonClicked) {
				event.preventDefault();
				event.returnValue = ""; // Required for browser to show prompt
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isDownloadButtonClicked]);

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
					onClose={resetAndNavigateAway}
				/>
			</div>
			<GoBackAlert
				open={blocker.state === "blocked"}
				onClose={() => {
					blocker.reset?.();
				}}
				onGoBack={() => {
					blocker.proceed?.();
					resetAndNavigateAway();
				}}
			/>
		</div>
	);
};
