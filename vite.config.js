import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function injectCss() {
  let cssContent = "";

  return {
    name: "inject-css",
    transform(code, id) {
      if (id.endsWith(".css")) {
        cssContent += code;
        // Return an empty module so that this CSS isn't output separately.
        return "";
      }
    },
    generateBundle(options, bundle) {
      // Loop over JS bundle files and inject our code.
      for (const fileName in bundle) {
        if (fileName.endsWith(".js")) {
          // Combine your Tailwind variables (adjust as needed) with the accumulated CSS.
          const tailwindVars = `
:host {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
}
`;
          const combinedCSS = tailwindVars + cssContent;
          const safeCSS = JSON.stringify(combinedCSS);

          // This injection snippet patches WidgetLibrary.init so that when the widget mounts:
          // • It attaches a shadow root (if not already attached)
          // • It injects the combined CSS into that shadow DOM
          // • It sets up a MutationObserver on document.body that watches for any node with
          //   data-radix-popper-content-wrapper and re-parents it into the widget's shadow root.
          const injection = `
(function(){
  if (typeof window.WidgetLibrary === 'undefined') {
    console.error('WidgetLibrary is not defined.');
    return;
  }
  const originalInit = window.WidgetLibrary.init;
  window.WidgetLibrary.init = function(widgetId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found');
      return;
    }
    var shadow;
    if (container.__shadowAttached) {
      shadow = container.__shadowRoot;
    } else {
      try {
        shadow = container.attachShadow({ mode: 'open' });
        container.__shadowAttached = true;
        container.__shadowRoot = shadow;
      } catch(e) {
        console.error('Failed to attach shadow:', e);
        return;
      }
    }
    if (!shadow.querySelector('style[data-injected]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-injected', 'true');
      styleEl.textContent = ${safeCSS};
      shadow.appendChild(styleEl);
    }
    // Set up a MutationObserver to catch any Radix popper content (the dropdown)
    // that would normally be appended to document.body. When detected, remove it
    // and re-parent it into the shadow DOM so that styles are applied properly.
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.hasAttribute &&
            node.hasAttribute('data-radix-popper-content-wrapper')
          ) {
            try {
              if (node.parentNode) {
                node.parentNode.removeChild(node);
              }
              // Append the popper content into the same shadow DOM.
              shadow.appendChild(node);
            } catch(e) {
              console.error('Error moving popper node:', e);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return originalInit.call(this, widgetId, containerId);
  };
})();
`;

          bundle[fileName].code = bundle[fileName].code + injection;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), injectCss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: "src/index.jsx",
      name: "WidgetLibrary",
      fileName: (format) => `widget-library.${format}.js`,
      formats: ["umd"],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
});
