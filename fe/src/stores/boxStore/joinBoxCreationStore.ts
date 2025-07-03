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
	treshold: 1,
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
	};
} & typeof joinBoxCreationState;

export const useJoinBoxCreationState = create<JoinBoxState>((set) => ({
	...joinBoxCreationState,
	actions: {
		start: () =>
			set(() => {
				const newState = {
					...joinBoxCreationState,
					connecting: true,
				};
				console.log("joinBoxCreationStore state updated", newState);
				return newState;
			}),
		connectYou: ({
			you,
			leader,
		}: {
			you: ParticipantType;
			leader: ParticipantType;
		}) =>
			set((state) => {
				const newState = {
					leader,
					you,
					connecting: false,
					connected: true,
					error: null,
				};
				console.log("joinBoxCreationStore state updated", {
					...state,
					...newState,
				});
				return newState;
			}),
		connectParticipant: (participant: ParticipantType) => {
			set((state) => {
				const newState = {
					otherParticipants: [...state.otherParticipants, participant],
				};
				console.log("joinBoxCreationStore state updated", {
					...state,
					...newState,
				});
				return newState;
			});
		},
		disconnectParticipant: (participantId: string) => {
			set((state) => {
				const newState = {
					otherParticipants: state.otherParticipants.filter(
						(participant) => participant.id !== participantId,
					),
				};
				console.log("joinBoxCreationStore state updated", {
					...state,
					...newState,
				});
				return newState;
			});
		},
		create: () =>
			set({
				created: true,
			}),
		reset: () =>
			set({
				...joinBoxCreationState,
			}),
	},
}));
