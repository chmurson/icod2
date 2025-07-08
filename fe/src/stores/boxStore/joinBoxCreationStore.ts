import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ParticipantType } from "./common-types";

const joinBoxCreationState = {
	state: "initial" as
		| "initial"
		| "set-name"
		| "connecting"
		| "connected"
		| "created",
	title: "",
	connecting: false,
	connected: false,
	created: false,
	error: null as string | null,
	you: {
		id: "",
		name: "",
		userAgent: "",
	} satisfies ParticipantType,
	leader: {
		id: "",
		name: "",
		userAgent: "",
	} satisfies ParticipantType,
	otherParticipants: [] as ParticipantType[],
	content: "",
	threshold: 1,
	encryptedMessage: "",
	generatedKey: "",
};

export type JoinBoxStateData = typeof joinBoxCreationState;

type JoinBoxState = {
	actions: {
		reset: () => void;
		start: () => void;
		connect: (args: { name: string; userAgent: string }) => void;
		connectYou: (args: {
			you: ParticipantType;
			leader: ParticipantType;
		}) => void;
		connectParticipant: (participant: ParticipantType) => void;
		disconnectParticipant: (participantId: string) => void;
		create: (message: {
			title?: string;
			content?: string;
			encryptedMessage?: string;
			generatedKey?: string;
		}) => void;
		setInfoBox: (threshold: number, content: string, title: string) => void;
	};
} & JoinBoxStateData;

export const useJoinBoxCreationState = create<JoinBoxState>()(
	devtools((set) => ({
		...joinBoxCreationState,
		actions: {
			start: () => set({ ...joinBoxCreationState, state: "set-name" }),
			connect: ({ name, userAgent }) =>
				set((state) => ({
					...joinBoxCreationState,
					connecting: true,
					state: "connecting",
					you: {
						...state.you,
						name,
						userAgent,
					},
				})),
			connectYou: ({
				you,
				leader,
			}: {
				you: ParticipantType;
				leader: ParticipantType;
			}) =>
				set((state) => ({
					leader,
					you: {
						...state.you,
						id: you.id,
					},
					connecting: false,
					connected: true,
					error: null,

					state: "connected",
				})),
			connectParticipant: (participant: ParticipantType) => {
				set((state) => ({
					otherParticipants: [
						...state.otherParticipants,
						{
							...participant,
						},
					],
				}));
			},
			disconnectParticipant: (participantId: string) => {
				set((state) => ({
					otherParticipants: state.otherParticipants.filter(
						(participant) => participant.id !== participantId,
					),
				}));
			},
			create: (message) =>
				set({
					...message,
					created: true,
					state: "created",
				}),
			reset: () =>
				set({
					...joinBoxCreationState,
				}),
			setInfoBox: (threshold, content, title) =>
				set({
					threshold,
					content,
					title,
				}),
		},
	})),
);
