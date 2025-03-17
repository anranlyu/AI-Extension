import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {},
  entries: {
    contentFloating: './entrypoint/content/Floating/contentFloating.tsx'
  },
  manifest: {
    "manifest_version": 3,
    "name": "LumiRead",
    "version": "1.0.0",
    "action": { "default_popup": "popup.html" },
    "host_permissions": ["http://*/*", "https://*/*"],
    "permissions": [
      "activeTab",
      "scripting",
      "tabs",
      "storage"
    ],
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["content-scripts/contentFloating.bundle.js"],
        "run_at": "document_end"
      }
    ],
    "web_accessible_resources": [
      {
        "resources": ["fonts/OpenDyslexicMono-Regular.otf"],
        "matches": ["http://*/*", "https://*/*"]
      }
    ]
  },
});
