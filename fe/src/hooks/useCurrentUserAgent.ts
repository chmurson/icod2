export const useCurrentUserAgent = () => {
	const userAgent =
		typeof window !== "undefined" ? window.navigator.userAgent : "";
	return userAgent;
};
