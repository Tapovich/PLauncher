import React from "react";
import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import App from "./App.tsx";
import "./styles/globals.css";
import { initializeTelegramTheme } from "./lib/telegram-theme";
import { initSentry } from "./lib/sentry";

// Initialize Sentry (error tracking)
initSentry();

// Initialize Telegram theme
initializeTelegramTheme();

// Expand Telegram Mini App to full height
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// TON Connect manifest URL
const TONCONNECT_MANIFEST_URL =
  import.meta.env.VITE_TONCONNECT_MANIFEST_URL ||
  "https://launchkit.ai/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={TONCONNECT_MANIFEST_URL}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);

