import { loggerGate } from "@icod2/protocols";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

loggerGate.setLevel(import.meta.env.VITE_LOG_LEVEL ?? "log");
loggerGate.showStatusIfDev();

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
