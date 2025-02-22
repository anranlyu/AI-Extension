import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from "@tailwindcss/vite";
import manifest from './manifest.json'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest }),tailwindcss(),],
  legacy: {
    skipWebSocketTokenCheck: true
  }
})
