import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this line for GitHub Pages deployment
  base: '/chatbot/',
  define: {
    // This will replace `process.env.API_KEY` in the client-side source code
    // with the value of `VITE_GEMINI_API_KEY` from the build environment.
    // Vite automatically loads variables from .env files into process.env
    // during build, and GitHub Actions sets it from secrets.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
