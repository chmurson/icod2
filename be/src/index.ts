import { config } from "dotenv";
import { SignalingServer } from "./signaling";

config({ path: [".env.local", ".env"] });

const port = Number.parseInt(process.env.PORT ?? "8080", 10);
const hostname = process.env.VITE_SIGNALING_HOSTNAME ?? "0.0.0.0";

new SignalingServer(port, hostname);
