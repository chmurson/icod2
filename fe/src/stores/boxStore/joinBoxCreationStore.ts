import { create } from "zustand";
import {
	getReadableUserAgent,
	getUserAgentDeviceIcon,
} from "@/services/user-agent/get-user-agent";
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
		device: "❓" as DeviceType,
	} satisfies ParticipantType,
	leader: {
		id: "",
		name: "",
		userAgent: "",
		device: "❓" as DeviceType,
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
		start: () => set({ ...joinBoxCreationState, connecting: true }),
		connectYou: ({
			you,
			leader,
		}: {
			you: ParticipantType;
			leader: ParticipantType;
		}) =>
			set({
				leader: {
					...leader,
					userAgent: getReadableUserAgent(leader.userAgent),
					device: getUserAgentDeviceIcon(leader.userAgent),
				},
				you: {
					...you,
					userAgent: getReadableUserAgent(you.userAgent),
					device: getUserAgentDeviceIcon(you.userAgent),
				},
				connecting: false,
				connected: true,
				error: null,
			}),
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
		create: () => set({ created: true }),
		reset: () => set({ ...joinBoxCreationState }),
		setMessage: (message) => set(message),
	},
}));
