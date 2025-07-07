import { useDownloadBoxStore } from "@/stores";
import type { ParticipantType } from "@/stores/boxStore/common-types";

export const useCreateBoxDownloadState = () => {
	const state = useDownloadBoxStore((state) => state);

	if (state.type === "fromCreateBox") {
		const { content, leader, participants, threshold, title } = state.state;

		return {
			type: "fromCreateBox",
			title,
			threshold,
			leader,
			participants,
			content,
		};
	}

	if (state.type === "fromJoinBox") {
		return {
			type: "fromJoinBox",
			title: "",
			treshold: "",
			leader: {
				id: "",
				name: "",
				userAgent: "",
			} satisfies ParticipantType,
			participants: [],
			contnet: "",
		};
	}

	return {
		type: "",
		title: "",
		treshold: "",
		leader: {
			id: "",
			name: "",
			userAgent: "",
		} satisfies ParticipantType,
		participants: [],
		contnet: "",
	};
	// const title = useCreateBoxStore((state) => state.title);
	// const treshold = useCreateBoxStore((state) => state.threshold);
	// const leader = useCreateBoxStore((state) => state.leader);
	// const participants = useCreateBoxStore((state) => state.participants);
	// const content = useCreateBoxStore((state) => state.content);
};
