import { SignalingServer } from "./signaling";

const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const HOSTNAME = "192.168.0.74"; // in order to allow access to app in local network

new SignalingServer(PORT, HOSTNAME);
