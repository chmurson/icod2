import { TextArea, TextField } from "@radix-ui/themes";
import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import type React from "react";
import { useEffect, useState } from "react";
import { leaderService } from "@/services/web-rtc/leaderSingleton";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { useDownloadBoxStore } from "@/stores/boxStore/downloadBoxStore";
import { useJoinBoxCreationState } from "@/stores/boxStore/joinBoxCreationStore";
import { Button } from "@/ui/Button.tsx";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../components/FieldArea";
import { InputNumber } from "../components/InputNumber";
import { ParticipantItem } from "../components/ParticipantItem";

const CreateBox: React.FC = () => {
	const title = useCreateBoxStore((state) => state.title);
	const content = useCreateBoxStore((state) => state.content);
	const leader = useCreateBoxStore((state) => state.leader);
	const threshold = useCreateBoxStore((state) => state.threshold);
	const participants = useCreateBoxStore((state) => state.participants);
	const actions = useCreateBoxStore((state) => state.actions);
	const createDownloadStoreFromCreateBox = useDownloadBoxStore(
		(state) => state.fromCreateBox,
	);

	const [localTitle, setLocalTitle] = useState(title);
	const [localContent, setLocalContent] = useState(content);

	useEffect(() => {
		init(wasm);
		leaderService.connect({
			userName: leader.name,
			onId: (data) => {
				actions.connectLeader({ id: data.id });
			},
			onPeerConnected: async (data) => {
				// Leader initiates connection with new peer
				let peer = leaderService.signaling
					.getPeerConnections()
					.get(data.peerId);
				if (!peer) {
					peer = leaderService.signaling.setupPeerConnection(data.peerId, true);
				}
				const offer = await peer.createOffer();
				await peer.setLocalDescription(offer);
				leaderService.signaling
					.getWebSocket()
					?.send(
						JSON.stringify({ type: "offer", targetId: data.peerId, offer }),
					);
				// Add participant to store (excluding leader)
				if (data.peerId !== useJoinBoxCreationState.getState().leader.id) {
					actions.connectParticipant({
						id: data.peerId,
						name: data.name,
						userAgent: data.userAgent,
					});
				}
			},
			onPeerDisconnected: (data) => {
				actions.disconnectParticipant(data.peerId);
			},
		});

		return () => {
			leaderService.disconnect();
		};
	}, [
		actions.connectLeader,
		actions.connectParticipant,
		actions.disconnectParticipant,
		leader.name,
	]);

	const noParticipantConnected = participants.length === 0;

	const handleBoxCreation = () => {
		const numKeys = participants.length + 1; // Leader + participants
		const secured = secure_message(
			localContent,
			undefined,
			new ChunksConfiguration(threshold, numKeys - threshold),
		);

		actions.create({
			title: localTitle,
			content: localContent,
			encryptedMessage: secured.encrypted_message[0] as string,
			generatedKey: secured.chunks[0],
			generatedKeys: secured.chunks as string[],
		});
		createDownloadStoreFromCreateBox();
		// Send encrypted message to participants
		leaderService.createBox({
			type: "createBox",
			title: localTitle,
			content: localContent,
			encryptedMessage: secured.encrypted_message[0] as string,
			generatedKey: secured.chunks[0],
		});
	};

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
							actions.setThreshold(Number.parseInt(e.currentTarget.value))
						}
						className="min-w-10"
					/>
				</FieldArea>
				<FieldArea label="You - leader">
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</FieldArea>
				<FieldArea label="Participants: ">
					<div className="flex flex-col gap-1.5">
						{participants.length === 0 && (
							<Text variant="secondaryText">
								No participants yet. Waiting for others to join...
							</Text>
						)}
						{participants.map((p) => (
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
					onClick={handleBoxCreation}
					disabled={noParticipantConnected}
				>
					Create Box
				</Button>
			</div>
		</div>
	);
};

export default CreateBox;
