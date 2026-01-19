import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PacerProvider } from "@tanstack/react-pacer/provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PacerProvider>
      <App />
    </PacerProvider>
  </StrictMode>,
);
