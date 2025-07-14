import { TextArea, TextField } from "@radix-ui/themes";
import init, { ChunksConfiguration, secure_message } from "icod-crypto-js";
import wasm from "icod-crypto-js/icod_crypto_js_bg.wasm?url";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
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
	const { state, actions, validate, getError } = useStoreState();

	const { content, leader, keyholders, threshold, title } = state;

	const createDownloadStoreFromCreateBox = useDownloadBoxStore(
		(state) => state.fromCreateBox,
	);

	const [localTitle, setLocalTitle] = useState(title);
	const [localContent, setLocalContent] = useState(content);
	const [localThreshold, setLocalThreshold] = useState(threshold);

	useEffect(() => {
		const timeoutHandler = setTimeout(() => {
			actions.setBoxInfo({
				title: localTitle,
				content: localContent,
				threshold: localThreshold,
			});
		}, 250);

		leaderService.sendBoxInfo({
			type: "boxInfo",
			threshold: localThreshold,
			content: localContent,
			title: localTitle,
		});

		return () => clearTimeout(timeoutHandler);
	}, [localTitle, localContent, localThreshold, actions.setBoxInfo]);

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

	const noParticipantConnected = keyholders.length === 0;

	const handleBoxCreation = () => {
		const isStateValid = validate({ title: localTitle, content: localContent });
		if (!isStateValid) {
			return;
		}
		const numKeys = keyholders.length + 1; // Leader + keyholders
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
					{getError("title") && (
						<Text variant="primaryError">{getError("title")}</Text>
					)}
				</FieldArea>
				<FieldArea label="Content: ">
					<TextArea
						id="content"
						value={localContent}
						onChange={(e) => setLocalContent(e.target.value)}
						rows={10}
						className="w-full"
					/>
					{getError("content") && (
						<Text variant="primaryError">{getError("content")}</Text>
					)}
				</FieldArea>
				<FieldArea label="Treshold:">
					<InputNumber
						min={1}
						defaultValue={1}
						max={10}
						onChange={(e) =>
							setLocalThreshold(Number.parseInt(e.currentTarget.value))
						}
						className="min-w-10"
					/>
					{getError("threshold") && (
						<Text variant="primaryError">{getError("threshold")}</Text>
					)}
				</FieldArea>
				<FieldArea label="You - leader">
					<ParticipantItem name={leader.name} userAgent={leader.userAgent} />
				</FieldArea>
				<FieldArea label="Keyholders: ">
					<div className="flex flex-col gap-1.5">
						{keyholders.length === 0 && (
							<Text variant="secondaryText">
								No keyholders yet. Waiting for others to join...
							</Text>
						)}
						{keyholders.map((p) => (
							<ParticipantItem
								key={p.id}
								name={p.name}
								userAgent={p.userAgent}
							/>
						))}
					</div>
					{getError("keyholders") && (
						<Text variant="primaryError">{getError("keyholders")}</Text>
					)}
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

const createBoxSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(3, { message: "Title must be at least 3 characters long." }),
		content: z.string().trim().min(1, { message: "Content cannot be empty." }),
		threshold: z.number().min(1, { message: "Threshold must be at least 1." }),
		keyholders: z
			.array(z.any())
			.min(1, { message: "At least one keyholders is required." }),
	})
	.refine((data) => data.threshold <= data.keyholders.length + 1, {
		message: "Threshold cannot be greater than the total number of keyholders.",
		path: ["threshold"], // This will attach the error message to the `threshold` field
	});

type CreateBoxSchema = z.infer<typeof createBoxSchema>;

const useStoreState = () => {
	const title = useCreateBoxStore((state) => state.title);
	const content = useCreateBoxStore((state) => state.content);
	const leader = useCreateBoxStore((state) => state.leader);
	const threshold = useCreateBoxStore((state) => state.threshold);
	const keyholders = useCreateBoxStore((state) => state.keyholders);
	const actions = useCreateBoxStore((state) => state.actions);

	const [errors, setErrors] = useState<z.ZodError | null>(null);

	const validate = useCallback(
		(partialStateUpdate?: Partial<CreateBoxSchema>) => {
			setErrors(null);
			const dataToValidate = {
				title,
				content,
				keyholders,
				threshold,
				...partialStateUpdate,
			} satisfies CreateBoxSchema;

			const validationResult = createBoxSchema.safeParse(dataToValidate);

			if (!validationResult.success) {
				setErrors(validationResult.error);
				return false;
			}
			return true;
		},
		[title, content, keyholders, threshold],
	);

	const getError = (fieldName: keyof CreateBoxSchema) => {
		return errors?.errors.find((e) => e.path[0] === fieldName)?.message;
	};

	return {
		state: {
			title,
			content,
			leader,
			threshold,
			keyholders,
		},
		actions,
		getError,
		validate: validate,
	};
};
