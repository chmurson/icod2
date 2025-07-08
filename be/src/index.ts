import { SignalingServer } from "./signaling";

const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const HOSTNAME = "localhost"; // in order to allow access to app in local network, put IP

new SignalingServer(PORT, HOSTNAME);
