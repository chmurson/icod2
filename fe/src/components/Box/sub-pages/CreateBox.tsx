import { TextArea, TextField } from "@radix-ui/themes";
import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import type React from "react";
import { useEffect, useState } from "react";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { Button } from "@/ui/Button.tsx";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../components/FieldArea";
import { InputNumber } from "../components/InputNumber";
import { ParticipantItem } from "../components/ParticipantItem";

const CreateBox: React.FC = () => {
	const state = useCreateBoxStore((state) => state);
	const leader = useCreateBoxStore((state) => state.leader);
	const particiapants = useCreateBoxStore((state) => state.participants);
	const actions = useCreateBoxStore((state) => state.actions);

	const [localTitle, setLocalTitle] = useState(state.title);
	const [localContent, setLocalContent] = useState(state.content);

	useEffect(() => {
		init(wasm);
		webRTCService.connectLeader();

		return () => {
			webRTCService.disconnect();
		};
	}, []);

	const handleShareContent = () => {
		const numKeys = state.participants.length + 1; // Leader + participants
		const secured = secure_message(
			localContent,
			undefined,
			new ChunksConfiguration(state.threshold, numKeys - state.threshold),
		);

		actions.setMessage({
			title: localTitle,
			content: localContent, // Keep original content for local display
			encryptedMessage: secured.encrypted_message[0] as string,
			generatedKey: secured.chunks[0],
			generatedKeys: secured.chunks as string[],
		});
	};

	const noParticipantConnected = particiapants.length === 0;

	return (
		<div className="flex flex-col gap-6">
			<Text variant="pageTitle" className="mt-4">
				Create a box
			</Text>
			<div className="flex flex-col gap-4">
				<FieldArea label="Name of the box">
					<TextField.Root
						id="title"
						type="text"
						value={localTitle}
						onChange={(e) => setLocalTitle(e.target.value)}
						className="max-w-md w-full"
					/>
				</FieldArea>
				<FieldArea label="Content: ">
					<TextArea
						id="content"
						value={localContent}
						onChange={(e) => setLocalContent(e.target.value)}
						rows={10}
						className="w-full"
					/>
				</FieldArea>
				<FieldArea label="Treshold:">
					<InputNumber
						min={1}
						defaultValue={1}
						max={10}
						onChange={(e) =>
							actions.setMessage({
								threshold: Number.parseInt(e.currentTarget.value),
							})
						}
						className="min-w-10"
					/>
				</FieldArea>
				<FieldArea label="You - leader">
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</FieldArea>
				<FieldArea label="Participants: ">
					<div className="flex flex-col gap-1.5">
						{particiapants.length === 0 && (
							<Text variant="secondaryText">
								No participants yet. Waiting for others to join...
							</Text>
						)}
						{particiapants.map((p) => (
							<ParticipantItem
								key={p.id}
								name={p.name}
								userAgent={p.userAgent}
							/>
						))}
					</div>
				</FieldArea>
			</div>
			<div>
				<Button
					variant="prominent"
					onClick={actions.create}
					disabled={noParticipantConnected}
				>
					Create Box
				</Button>
			</div>
			<div className="mt-2">
				<Button variant="secondary" onClick={handleShareContent}>
					Share Content
				</Button>
			</div>
			<fieldset className="mt-4" />
			<PrettyJson>{state}</PrettyJson>
		</div>
	);
};

const PrettyJson: React.FC<{ children: object }> = ({ children }) => {
	return (
		<pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
			{JSON.stringify(children, null, 2)}
		</pre>
	);
};

export default CreateBox;
