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

type CreateBoxState = {
	actions: {
		reset: () => void;
		start: () => void;
		connectYou: (args: {
			you: ParticipantType;
			leader: ParticipantType;
		}) => void;
		connectParticiapnt: (participant: ParticipantType) => void;
		create: () => void;
	};
} & typeof joinBoxCreationState;

export const useJoinBoxCreationState = create<CreateBoxState>((set) => ({
	...joinBoxCreationState,
	actions: {
		start: () =>
			set({
				...joinBoxCreationState,
				connecting: true,
			}),
		connectYou: ({
			you,
			leader,
		}: {
			you: ParticipantType;
			leader: ParticipantType;
		}) => ({
			leader,
			you,
			connecting: false,
			connected: true,
			error: null,
		}),
		connectParticiapnt: (participant: ParticipantType) =>
			set((state) => ({
				otherParticipants: [...state.otherParticipants, participant],
			})),
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
