import { TextArea } from "@radix-ui/themes";
import type React from "react";
import { useEffect } from "react";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import { useJoinBoxCreationState } from "@/stores";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../components/FieldArea";
import { ParticipantItem } from "../components/ParticipantItem";

export const JoinBox: React.FC = () => {
	const { leader, otherParticipants, threshold, title, you, content } =
		useStoreSlice();

	useEffect(() => {
		webRTCService.connectParticipant();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	return (
		<div className="flex flex-col gap-8">
			<Text variant="pageTitle" className="mt-4">
				Join a Box Creation
			</Text>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 items-end">
					<Text variant="label">Name:</Text>
					<Text variant="primaryText">{title}</Text>
				</div>
				<div className="flex gap-2 items-end">
					<Text variant="label">Treshold:</Text>
					<Text variant="primaryText">{threshold}</Text>
				</div>
				<FieldArea label="Leader">
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</FieldArea>
				<FieldArea label="You">
					<ParticipantItem name={you.name} userAgent={you.userAgent} />
				</FieldArea>
				<FieldArea label="Participants: ">
					<div className="flex flex-col gap-1.5">
						{otherParticipants.length === 0 && (
							<Text variant="secondaryText">
								No participants yet. Waiting for others to join...
							</Text>
						)}
						{otherParticipants.map((p) => (
							<ParticipantItem
								key={p.id}
								name={p.name}
								userAgent={p.userAgent}
							/>
						))}
					</div>
				</FieldArea>
				<FieldArea label="Content">
					<TextArea disabled rows={6} value={content} className="w-full" />
				</FieldArea>
			</div>
			<Text variant="primaryText">
				Waiting for more participants, or leader to create finalize box
				creation.
			</Text>
		</div>
	);
};

const useStoreSlice = () => {
	const title = useJoinBoxCreationState((state) => state.title);
	const leader = useJoinBoxCreationState((state) => state.leader);
	const you = useJoinBoxCreationState((state) => state.you);
	const threshold = useJoinBoxCreationState((state) => state.threshold);
	const otherParticipants = useJoinBoxCreationState(
		(state) => state.otherParticipants,
	);
	const content = useJoinBoxCreationState((state) => state.content);

	return {
		title,
		leader,
		you,
		threshold,
		otherParticipants,
		content,
	};
};

const _PrettyJson: React.FC<{ children: object }> = ({ children }) => {
	return (
		<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
			{JSON.stringify(children, null, 2)}
		</pre>
	);
};

export default JoinBox;
