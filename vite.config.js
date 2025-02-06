import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Add this plugin to inject CSS
function injectCss() {
  let cssContent = "";

  return {
    name: "inject-css",
    transform(code, id) {
      if (id.endsWith(".css")) {
        cssContent += code;
        // Return an empty module so that the CSS isn't output separately.
        return "";
      }
    },
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        if (fileName.endsWith(".js")) {
          // Use JSON.stringify to produce a valid JS string literal including any quotes (like in "Apple Color Emoji")
          const safeCSS = JSON.stringify(cssContent);

          // Build injection code via string concatenation.
          const injection =
            "(function(){\n" +
            "  if (typeof window.WidgetLibrary === 'undefined') {\n" +
            "    console.error('WidgetLibrary is not defined.');\n" +
            "    return;\n" +
            "  }\n" +
            "  const originalInit = window.WidgetLibrary.init;\n" +
            "  window.WidgetLibrary.init = function(widgetId, containerId) {\n" +
            "    const container = document.getElementById(containerId);\n" +
            "    if (!container) {\n" +
            "      console.error('Container not found');\n" +
            "      return;\n" +
            "    }\n" +
            "    var shadow;\n" +
            "    if (container.__shadowAttached) {\n" +
            "      shadow = container.__shadowRoot;\n" +
            "    } else {\n" +
            "      try {\n" +
            "        shadow = container.attachShadow({ mode: 'open' });\n" +
            "        container.__shadowAttached = true;\n" +
            "        container.__shadowRoot = shadow;\n" +
            "      } catch(e) {\n" +
            "        console.error('Failed to attach shadow:', e);\n" +
            "        return;\n" +
            "      }\n" +
            "    }\n" +
            "    const styleEl = document.createElement('style');\n" +
            "    styleEl.textContent = " +
            safeCSS +
            ";\n" +
            "    if (!shadow.querySelector('style[data-injected]')) {\n" +
            "      styleEl.setAttribute('data-injected', 'true');\n" +
            "      shadow.appendChild(styleEl);\n" +
            "    }\n" +
            "    return originalInit.call(this, widgetId, containerId);\n" +
            "  };\n" +
            "})();\n";

          // Append the injection snippet to the end of the bundle.
          bundle[fileName].code = bundle[fileName].code + injection;
        }
      }
    },
  };
}

// https://vite.dev/config/
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
        assetFileNames: () => "widget-library.[ext]",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
});
