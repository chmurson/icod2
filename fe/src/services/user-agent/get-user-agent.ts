import { detect } from "detect-browser";

const laptopEmoji = "💻";
const smartphoneEmoji = "📱";
const questionMarkEmoji = "❓";

export const getReadableUserAgent = (userAgent: string) => {
	const browserInfo = detect(userAgent);
	return browserInfo ? browserInfo.name : userAgent;
};

export const getUserAgentDeviceIcon = (userAgent: string) => {
	const browserInfo = detect(userAgent);

	if (!browserInfo) {
		return questionMarkEmoji;
	}

	if (browserInfo.type === "react-native") {
		return smartphoneEmoji;
	}

	if (browserInfo.type === "browser") {
		return laptopEmoji;
	}

	return questionMarkEmoji;
};
