import { create } from "zustand";
import type { DeviceType, ParticipantType } from "./common-types";

const joinBoxCreationState = {
	title: "",
	connecting: false,
	connected: false,
	created: false,
	error: null as string | null,
	you: {
		id: "",
		name: "",
		userAgent: "",
		device: "mobile" as DeviceType,
	} satisfies ParticipantType,
	leader: {
		id: "",
		name: "",
		userAgent: "",
		device: "mobile" as DeviceType,
	} satisfies ParticipantType,
	otherParticipants: [] as ParticipantType[],
	content: "",
	threshold: 1,
	encryptedMessageParts: [] as string[],
	generatedKeys: [] as string[],
	chunksConfiguration: undefined as ChunksConfiguration | undefined,
};

import type { ChunksConfiguration } from "icod-crypto-js";

type JoinBoxState = {
	actions: {
		reset: () => void;
		start: () => void;
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
			encryptedMessageParts?: string[];
			generatedKeys?: string[];
			chunksConfiguration?: ChunksConfiguration;
		}) => void;
	};
} & typeof joinBoxCreationState;

export const useJoinBoxCreationState = create<JoinBoxState>((set) => ({
	...joinBoxCreationState,
	actions: {
		start: () => set({ ...joinBoxCreationState, connecting: true }),
		connectYou: ({
			you,
			leader,
		}: {
			you: ParticipantType;
			leader: ParticipantType;
		}) => set({ leader, you, connecting: false, connected: true, error: null }),
		connectParticipant: (participant: ParticipantType) => {
			set((state) => ({
				otherParticipants: [...state.otherParticipants, participant],
			}));
		},
		disconnectParticipant: (participantId: string) => {
			set((state) => ({
				otherParticipants: state.otherParticipants.filter(
					(participant) => participant.id !== participantId,
				),
			}));
		},
		create: () => set({ created: true }),
		reset: () => set({ ...joinBoxCreationState }),
		setMessage: (message) => set(message),
	},
}));
