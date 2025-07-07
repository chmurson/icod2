import type {
	BoxStateUpdateMessage,
	ThresholdStateUpdateMessage,
} from "@icod2/contracts";
import { useDownloadBoxStore } from "@/stores";
import { useJoinBoxCreationState } from "@/stores/boxStore/joinBoxCreationStore";
import type { WebRTCMessageHandler } from "../types";

export const handleBoxStateUpdate: WebRTCMessageHandler = (data, _ctx) => {
	const { create } = useJoinBoxCreationState.getState().actions;
	const { fromJoinBox } = useDownloadBoxStore.getState();
	const { type, ...messageWithoutType } = data as BoxStateUpdateMessage;
	create(messageWithoutType);
	fromJoinBox();
};

export const handleThresholdStateUpdate: WebRTCMessageHandler = (
	data,
	_ctx,
) => {
	const { setThreshold } = useJoinBoxCreationState.getState().actions;
	setThreshold((data as ThresholdStateUpdateMessage).threshold);
};
