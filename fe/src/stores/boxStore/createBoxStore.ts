import { create } from "zustand";
import { webRTCService } from "@/services/WebRTCService";
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
	threshold: 1,
};

type CreateBoxState = {
	actions: {
		reset: () => void;
		connectLeader: (leader: ParticipantType) => void;
		connectParticipant: (participant: ParticipantType) => void;
		disconnectParticipant: (participantId: string) => void;
		start: () => void;
		create: () => void;
		setMessage: (message: {
			title?: string;
			content?: string;
			threshold?: number;
		}) => void;
	};
} & typeof createBoxDefaultState;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
	...createBoxDefaultState,
	actions: {
		start: () => set({ ...createBoxDefaultState, connecting: true }),
		connectLeader: (leader) =>
			set({ leader, connecting: false, connected: true, error: null }),
		connectParticipant: (participant) =>
			set((state) => ({ participants: [...state.participants, participant] })),
		disconnectParticipant: (participantId: string) => {
			set((state) => ({
				participants: state.participants.filter(
					(participant) => participant.id !== participantId,
				),
			}));
		},
		create: () => set({ created: true, connected: true, connecting: false }),
		reset: () => set({ ...createBoxDefaultState }),
		setMessage: (message) => {
			set(message);
			webRTCService.sendMessage({ type: "boxStateUpdate", ...message });
		},
	},
}));
