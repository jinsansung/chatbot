import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this line for GitHub Pages deployment
  base: '/chatbot/',
  // This will replace `process.env.API_KEY` in the source code with the 
  // actual API key from the build environment (like GitHub Secrets).
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
