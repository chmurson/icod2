export type DeviceType = "mobile" | "tablet" | "desktop";

export type ParticipantType = {
	id: string;
	name: string;
	userAgent: string;
	device: DeviceType;
};
