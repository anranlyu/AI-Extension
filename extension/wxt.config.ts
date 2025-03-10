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
    "host_permissions": ["https://www.toronto.ca/news/city-of-toronto-and-cupe-local-79-reach-tentative-agreement-media-availability-at-145-a-m/"],
    "permissions": [
        "activeTab",
        "scripting",
        "tabs",
        "storage"
    ],

  },
});
