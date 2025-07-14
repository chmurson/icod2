import { TextArea } from "@radix-ui/themes";
import type React from "react";
import { useEffect } from "react";
import { ParticipantService, SignalingService } from "@/services/web-rtc";
import { useJoinBoxCreationState } from "@/stores";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../components/FieldArea";
import { ParticipantItem } from "../components/ParticipantItem";

// Singleton for the session
const participantService = new ParticipantService(new SignalingService());

export const JoinBox: React.FC = () => {
	const { leader, otherKeyholders, threshold, title, you, content } =
		useStoreSlice();
	const actions = useJoinBoxCreationState((state) => state.actions);

	useEffect(() => {
		participantService.connect({
			userName: you.name,
			onAcknowledgeLeader: (data) => {
				const { connectYou } = useJoinBoxCreationState.getState().actions;
				connectYou({
					you: {
						id:
							participantService.signaling.getMyId() ??
							"id-not-assigned-probably-error",
						name: you.name,
						userAgent: you.userAgent,
					},
					leader: {
						id: data.leaderId,
						name: data.leaderName,
						userAgent: data.leaderUserAgent,
					},
				});
			},
			onPeerConnected: async (data) => {
				const { connectParticipant } =
					useJoinBoxCreationState.getState().actions;
				if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
					connectParticipant({
						id: data.peerId,
						name: data.name,
						userAgent: data.userAgent,
					});
				}
			},
			onPeerDisconnected: (data) => {
				const { disconnectParticipant } =
					useJoinBoxCreationState.getState().actions;
				disconnectParticipant(data.peerId);
			},
		});

		return () => {
			participantService.disconnect();
		};
	}, [you.name, you.userAgent]);

	return (
		<div className="flex flex-col gap-8">
			<Text variant="pageTitle" className="mt-4">
				Join a Box Creation
			</Text>
			{!leader?.id && (
				<div className="flex flex-col items-start gap-4">
					<Text variant="primaryError">No leader connected</Text>
					<Button variant="primary" onClick={actions.reset}>
						Go back
					</Button>
				</div>
			)}
			{!!leader?.id && (
				<BoxJoinContentForOK
					leader={leader}
					otherKeyholders={otherKeyholders}
					threshold={threshold}
					title={title}
					you={you}
					content={content}
				/>
			)}
		</div>
	);
};

const BoxJoinContentForOK = ({
	leader,
	threshold,
	title,
	you,
	otherKeyholders,
	content,
}: {
	title: string;
	threshold: number;
	otherKeyholders: { id: string; name: string; userAgent: string }[];
	leader: { name: string; userAgent: string };
	you: { name: string; userAgent: string };
	content: string;
}) => {
	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 items-center">
					<Text variant="label">Name:</Text>
					<Text variant="primaryText">{title}</Text>
				</div>
				<div className="flex gap-2 items-center">
					<Text variant="label">Key Treshold:</Text>
					<Text variant="primaryText">{threshold}</Text>
				</div>
				<FieldArea label="Leader:">
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</FieldArea>
				<FieldArea label="You:">
					<ParticipantItem name={you.name} userAgent={you.userAgent} />
				</FieldArea>
				<FieldArea label="Other keyholders: ">
					<div className="flex flex-col gap-1.5">
						{otherKeyholders.length === 0 && (
							<Text variant="secondaryText">
								No keyholders yet. Waiting for others to join...
							</Text>
						)}
						{otherKeyholders.map((p) => (
							<ParticipantItem
								key={p.id}
								name={p.name}
								userAgent={p.userAgent}
							/>
						))}
					</div>
				</FieldArea>
				<FieldArea label="Content:">
					<TextArea disabled rows={6} value={content} className="w-full" />
				</FieldArea>
			</div>
			<Text variant="primaryText">
				Waiting for more keyholders, or leader to create finalize box creation.
			</Text>
		</>
	);
};

const useStoreSlice = () => {
	const title = useJoinBoxCreationState((state) => state.title);
	const leader = useJoinBoxCreationState((state) => state.leader);
	const you = useJoinBoxCreationState((state) => state.you);
	const threshold = useJoinBoxCreationState((state) => state.threshold);
	const otherKeyholders = useJoinBoxCreationState(
		(state) => state.otherKeyholders,
	);
	const content = useJoinBoxCreationState((state) => state.content);

	return {
		title,
		leader,
		you,
		threshold,
		otherKeyholders,
		content,
	};
};

export default JoinBox;
