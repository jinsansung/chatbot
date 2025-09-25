import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this line for GitHub Pages deployment
  base: '/chatbot/',
  define: {
    // Injects the API key from the build environment into the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
