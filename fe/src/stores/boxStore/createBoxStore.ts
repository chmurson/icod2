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
		connectParticiapnt: (leader: ParticipantType) => void;
		start: () => void;
		create: () => void;
	};
} & typeof createBoxDefaultState;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
	...createBoxDefaultState,
	actions: {
		start: () =>
			set({
				...createBoxDefaultState,
				connecting: true,
			}),
		connectLeader: (leader) =>
			set({
				leader,
				connecting: false,
				connected: true,
				error: null,
			}),
		connectParticiapnt: (participant) =>
			set((state) => ({
				participants: [...state.participants, participant],
			})),
		create: () =>
			set({
				created: true,
			}),
		reset: () =>
			set({
				...createBoxDefaultState,
			}),
	},
}));
