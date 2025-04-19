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
    "version": "1.0.0",
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
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApDb2e2y+CuO/XvNzeZP0YRw70YMBbCx1hxEfhb441iaHBOcMUwDLnqeCNLiPNEvBelVFB/hHDkjAO6HJbXX1X4XQevHfvazpX/Qlq9FbtArBM8zgPzxh5EyKSxyo4cnl3S4TEJ+lpmevl1yP8X3hU9VBKyttJQ2f8VdkJXj2ir32wW+24BrH8wVgd8N+ZY4ssq5kPOkphMs/Le0RO2deU6kJx2hXjnZ+7q9m8vhlRuThc0D/MYbo7VL5cBkzgfHzT9vbt6+Vuif7R3f5a7AWXjX08qVoJ+oqRj/D5j2TeYa/rkBUQXX3vA6mZ0NsG+qQjkN2PuWLIbawTF4TzEtDNQIDAQAB"
  },

});