import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";


// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
    define: {
      'process.env.BACKEND_URL': JSON.stringify(process.env.NODE_ENV === 'production' 
        ? 'https://ai-extension-5vii.onrender.com' // production URL
        : 'http://localhost:5001')
    }
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {
    // ...
  },
  manifest: {
    "manifest_version": 3,
    "name": "LumiRead",
    "version": "1.0.1",
    "action": {},
    "permissions": [
        "activeTab",
        "tabs",
        "storage",
        "identity"
    ],
    "web_accessible_resources": [
      {
        "resources": [ "fonts/regular.otf","fonts/bold.otf","fonts/italic.otf","auth.html","popup.html" ],
        "matches": [ "http://*/*", "https://*/*" ]
      }
    ],
    
  },

});