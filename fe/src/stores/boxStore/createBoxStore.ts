import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
	getReadableUserAgent,
	getUserAgentDeviceIcon,
} from "@/services/user-agent/get-user-agent";
import { webRTCService } from "@/services/web-rtc/WebRTCService";
import type { ParticipantType } from "./common-types";

const createBoxDefaultState = {
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
	leader: {
		id: "",
		name: "",
		userAgent: "",
	} satisfies ParticipantType,
	participants: [] as ParticipantType[],
	content: "",
	threshold: 1,
	encryptedMessage: "",
	generatedKeys: [] as string[],
	generatedKey: "",
};

export type CreateBoxStateData = typeof createBoxDefaultState;

type CreateBoxState = {
	actions: {
		reset: () => void;
		connectLeader: (leader: { id: string }) => void;
		connectParticipant: (participant: ParticipantType) => void;
		disconnectParticipant: (participantId: string) => void;
		start: () => void;
		connect: (args: { name: string; userAgent: string }) => void;
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
} & CreateBoxStateData;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
	...createBoxDefaultState,
	actions: {
		connect: ({ name, userAgent }) =>
			set({
				...createBoxDefaultState,
				connecting: true,
				state: "connecting",
				leader: { id: "", name, userAgent },
			}),
		start: () => set({ ...createBoxDefaultState, state: "set-name" }),
		connectLeader: (leader) =>
			set((state) => ({
				leader: {
					...state.leader,
					id: leader.id,
				},
				connecting: false,
				connected: true,
				error: null,
				state: "connected",
			})),
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
		create: () =>
			set({
				created: true,
				state: "created",
			}),
		reset: () =>
			set({
				...createBoxDefaultState,
			}),
		setMessage: (message) => {
			set(message);
			const { content, generatedKeys, ...messageToSend } = message;
			webRTCService.sendMessage({ type: "boxStateUpdate", ...messageToSend });
		},
	},
}));
