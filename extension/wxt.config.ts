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
    "host_permissions": ["http://*/*", "https://*/*"],
    "action": {},
    "permissions": [
        "activeTab",
        "scripting",
        "tabs",
      "storage",
        "identity"
    ],
    "web_accessible_resources": [
      {
        "resources": [ "fonts/OpenDyslexicMono-Regular.otf","auth.html","popup.html" ],
        "matches": [ "http://*/*", "https://*/*" ]
      }
    ]
  },
  
});
