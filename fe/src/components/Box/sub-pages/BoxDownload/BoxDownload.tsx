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
import { useBoxDownloadState, useDownloadShard } from "./hooks";
import { useNaiveShowHiddenMessage } from "./hooks/useNaiveShowHiddenMessage";

export const BoxDownload: React.FC = () => {
	const state = useBoxDownloadState();

	const { hideMessage, showMessage, visibleMessage } =
		useNaiveShowHiddenMessage();

	const resetStoreStateAction = useCreateBoxStore(
		(state) => state.actions.reset,
	);

	const navigate = useNavigate();

	const [isShardDownloaded, setIsShardDownloaded] = useState(false);

	const { downloadKeyShardAndMessage, error: downloadError } = useDownloadShard(
		{
			onSuccess: () => setIsShardDownloaded(true),
		},
	);

	const handleClickDownloadButton = () => {
		downloadKeyShardAndMessage();
	};

	const resetAndNavigateAway = useCallback(() => {
		resetStoreStateAction();
		navigate("/");
	}, [resetStoreStateAction, navigate]);

	const shouldNavigationBeBlocked = useCallback(
		() => !isShardDownloaded,
		[isShardDownloaded],
	);

	const blocker = useBlocker(shouldNavigationBeBlocked);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isShardDownloaded) {
				event.preventDefault();
				event.returnValue = ""; // Required for browser to show prompt
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isShardDownloaded]);

	return (
		<div className="flex flex-col gap-8">
			<Text variant="pageTitle" className="mt-4">
				Box
			</Text>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 items-center">
					<Text variant="label">Name:</Text>
					<Text variant="primaryText">{state.title}</Text>
				</div>
				<div className="flex gap-2 items-center">
					<Text variant="label">Treshold:</Text>
					<Text variant="primaryText">{state.threshold}</Text>
				</div>
				<div className="flex flex-col gap-1">
					{!state.you && <Text variant="label">You - leader:</Text>}
					{state.you && <Text variant="label">Leader:</Text>}
					<ParticipantItem
						name={state.leader.name}
						userAgent={state.leader.userAgent}
					/>
				</div>
				{state.you && (
					<div className="flex flex-col gap-1">
						<Text variant="label">You:</Text>
						<ParticipantItem
							name={state.you.name}
							userAgent={state.you.userAgent}
						/>
					</div>
				)}
				{!state.you && (
					<div className="flex flex-col gap-1">
						<Text variant="label">Participants:</Text>
						<div>
							{state.participants.map((p) => (
								<ParticipantItem
									key={p.id}
									name={p.name}
									userAgent={p.userAgent}
								/>
							))}
						</div>
					</div>
				)}
				{state.you && state.otherParticipants.length > 0 && (
					<div className="flex flex-col gap-1">
						<Text variant="label">Other participants:</Text>
						<div>
							{state.otherParticipants.map((p) => (
								<ParticipantItem
									key={p.id}
									name={p.name}
									userAgent={p.userAgent}
								/>
							))}
						</div>
					</div>
				)}
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
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-end">
					<Button variant="prominent" onClick={handleClickDownloadButton}>
						<DownloadIcon /> Download box shard
					</Button>
					<ClosePageButton
						showAlert={!isShardDownloaded}
						onClose={resetAndNavigateAway}
					/>
				</div>
				<div>
					{downloadError && (
						<Text variant="primaryError" color="crimson">
							Failed to download: {downloadError}
						</Text>
					)}
				</div>
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
