import { create } from "zustand";
import {
	getReadableUserAgent,
	getUserAgentDeviceIcon,
} from "@/services/user-agent/get-user-agent";
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
		create: () => void;
		setMessage: (message: {
			title?: string;
			content?: string;
			threshold?: number;
			encryptedMessage?: string;
			generatedKey?: string;
		}) => void;
	};
} & typeof joinBoxCreationState;

export const useJoinBoxCreationState = create<JoinBoxState>((set) => ({
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
						userAgent: getReadableUserAgent(participant.userAgent),
						device: getUserAgentDeviceIcon(participant.userAgent),
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
		create: () =>
			set({
				created: true,
				state: "created",
			}),
		reset: () =>
			set({
				...joinBoxCreationState,
			}),
		setMessage: (message) => set(message),
	},
}));
