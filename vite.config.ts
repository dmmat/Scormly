import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base = '/Scormly/' for GitHub Pages deploys (https://<user>.github.io/Scormly/,
// the path is case-sensitive and must match the repo name), '/' for local dev.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Scormly/' : '/',
  plugins: [react(), tailwindcss()],
})
