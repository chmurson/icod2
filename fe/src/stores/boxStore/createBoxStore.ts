import { create } from "zustand";
import type { DeviceType, ParticipantType } from "./common-types";

const createBoxDefaultState = {
	title: "",
	connecting: false,
	connected: false,
	created: false,
	error: null as string | null,
	leader: {
		id: "",
		name: "",
		userAgent: "",
		device: "mobile" as DeviceType,
	} satisfies ParticipantType,
	participants: [] as ParticipantType[],
	content: "",
	treshold: 1,
};

type CreateBoxState = {
	actions: {
		reset: () => void;
		connectLeader: (leader: ParticipantType) => void;
		connectParticipant: (participant: ParticipantType) => void;
		disconnectParticipant: (participantId: string) => void;
		start: () => void;
		create: () => void;
	};
} & typeof createBoxDefaultState;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
	...createBoxDefaultState,
	actions: {
		start: () =>
			set(() => {
				const newState = {
					...createBoxDefaultState,
					connecting: true,
				};
				console.log("createBoxStore state updated", newState);
				return newState;
			}),
		connectLeader: (leader) =>
			set((state) => {
				const newState = {
					leader,
					connecting: false,
					connected: true,
					error: null,
				};
				console.log("createBoxStore state updated", { ...state, ...newState });
				return newState;
			}),
		connectParticipant: (participant) =>
			set((state) => {
				const newState = {
					participants: [...state.participants, participant],
				};
				console.log("createBoxStore state updated", { ...state, ...newState });
				return newState;
			}),
		disconnectParticipant: (participantId: string) => {
			set((state) => {
				const newState = {
					participants: state.participants.filter(
						(participant) => participant.id !== participantId,
					),
				};
				console.log("createBoxStore state updated", { ...state, ...newState });
				return newState;
			});
		},
		create: () =>
			set((state) => {
				const newState = {
					created: true,
					connected: true,
					connecting: false,
				};
				console.log("createBoxStore state updated", { ...state, ...newState });
				return newState;
			}),
		reset: () =>
			set(() => {
				console.log("createBoxStore state updated", createBoxDefaultState);
				return {
					...createBoxDefaultState,
				};
			}),
	},
}));
