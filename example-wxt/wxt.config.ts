import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    "manifest_version": 3,
    "name": "Simplifier",
    "version": "1.0.0",
    "action": { "default_popup": "popup.html" },
    "host_permissions": ["<all_urls>"],
    "permissions": [
        "activeTab",
        "scripting",
        "tabs",
        "storage"
    ],
    "web_accessible_resources": [
      {
        "resources": ["fonts/OpenDyslexicMono-Regular.otf"],
        "matches": ["<all_urls>"]
      }
    ]
  },
});
