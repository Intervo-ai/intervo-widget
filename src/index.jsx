import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WidgetProvider } from "./context/WidgetContext";
import "./index.css";

export const init = (widgetId, containerId) => {
  console.log(widgetId, "******widgetId******");
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  try {
    // Reuse an existing shadow root if available; otherwise, attach a new one.
    const shadow =
      container.shadowRoot || container.attachShadow({ mode: "open" });

    // Create a container div inside the shadow DOM if not already present.
    let widgetRoot = shadow.querySelector(`#widget-root-${containerId}`);
    if (!widgetRoot) {
      widgetRoot = document.createElement("div");
      widgetRoot.id = `widget-root-${containerId}`;
      widgetRoot.style.cssText = "display: contents;"; // Prevent extra wrapper affecting layout
      shadow.appendChild(widgetRoot);
    }

    // Create a mounting point for React
    const mountPoint = document.createElement("div");
    widgetRoot.appendChild(mountPoint);

    ReactDOM.createRoot(mountPoint).render(
      <React.StrictMode>
        <WidgetProvider widgetId={widgetId}>
          <App widgetId={widgetId} />
        </WidgetProvider>
      </React.StrictMode>
    );

    return () => {
      // Cleanup function
      ReactDOM.unmountComponentAtNode(mountPoint);
      // Optionally, clean up the mountPoint instead of detaching the shadow root,
      // because the shadow root might be shared with injected CSS.
      widgetRoot.removeChild(mountPoint);
    };
  } catch (error) {
    console.error("Failed to initialize widget:", error);
    return null;
  }
};

// Export for UMD
export default { init };
