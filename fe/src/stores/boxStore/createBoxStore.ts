import { create } from "zustand";
import {
	getReadableUserAgent,
	getUserAgentDeviceIcon,
} from "@/services/user-agent/get-user-agent";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
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
		device: "❓" as DeviceType,
	} satisfies ParticipantType,
	participants: [] as ParticipantType[],
	content: "",
	threshold: 1,
	encryptedMessage: "",
	generatedKeys: [] as string[],
	generatedKey: "",
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
			encryptedMessage?: string;
			generatedKeys?: string[];
			generatedKey?: string;
		}) => void;
	};
} & typeof createBoxDefaultState;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
	...createBoxDefaultState,
	actions: {
		start: () => set({ ...createBoxDefaultState, connecting: true }),
		connectLeader: (leader) =>
			set({
				leader: {
					...leader,
					userAgent: getReadableUserAgent(leader.userAgent),
					device: getUserAgentDeviceIcon(leader.userAgent),
				},
				connecting: false,
				connected: true,
				error: null,
			}),
		connectParticipant: (participant) =>
			set((state) => ({
				participants: [
					...state.participants,
					{
						...participant,
						userAgent: getReadableUserAgent(participant.userAgent),
						device: getUserAgentDeviceIcon(participant.userAgent),
					},
				],
			})),
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
			const { content, generatedKeys, ...messageToSend } = message;
			webRTCService.sendMessage({ type: "boxStateUpdate", ...messageToSend });
		},
	},
}));
