import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { WidgetProvider } from "@/context/WidgetContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WidgetProvider>
      <App />
    </WidgetProvider>
  </StrictMode>
);
