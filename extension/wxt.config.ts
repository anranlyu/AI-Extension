import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {
    // ...
  },
  manifest: {
    "manifest_version": 3,
    "name": "LumiRead",
    "version": "1.0.0",
    "action": { "default_popup": "popup.html" },
    "host_permissions": [ "http://*/*","https://*/*"],
    "permissions": [
        "activeTab",
        "scripting",
        "tabs",
        "storage"
    ],
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["contentFloating.bundle.js"],
        "run_at": "document_end"
      }
    ],
    "web_accessible_resources": [
      {
        "resources": [ "fonts/OpenDyslexicMono-Regular.otf" ],
        "matches": [ "http://*/*", "https://*/*" ]
      }
    ]
  },
  
});
