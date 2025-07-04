import { memo } from "react";
import {
	MdOutlineDesktopWindows,
	MdOutlinePhoneIphone,
	MdPhoneAndroid,
} from "react-icons/md";
import { UAParser } from "ua-parser-js";

export const UserAgent = memo(({ ua }: { ua: string }) => {
	const parsedUA = new UAParser(ua);

	const browser = parsedUA.getBrowser();
	const os = parsedUA.getOS();
	const device = parsedUA.getDevice();

	parsedUA.getDevice().type;
	return (
		<div className="flex gap-1 items-center">
			{getDeviceIcon(device.type, os)}
			<span>{os.name}</span>
			<span>-</span>
			<span>{browser.name}</span>
		</div>
	);
});

const getDeviceIcon = (type: UAParser.IDevice["type"], os: UAParser.IOS) => {
	if (type !== "mobile") {
		return <MdOutlineDesktopWindows />;
	}
	if (os.name?.match("ios")) {
		return <MdOutlinePhoneIphone />;
	}

	return <MdPhoneAndroid />;
};
