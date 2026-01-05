
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  define: {
    // Polyfill process.env.API_KEY for Google GenAI SDK
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600
  }
})
