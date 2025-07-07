import { useCreateBoxStore } from "@/stores";

export const useCreateBoxDownloadState = () => {
	const title = useCreateBoxStore((state) => state.title);
	const treshold = useCreateBoxStore((state) => state.threshold);
	const leader = useCreateBoxStore((state) => state.leader);
	const participants = useCreateBoxStore((state) => state.participants);

	return {
		title,
		treshold,
		leader,
		participants,
	};
};
