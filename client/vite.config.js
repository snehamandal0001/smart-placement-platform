import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Whenever React sees a request starting with /api...
      '/api': {
        target: 'http://localhost:5000', // ...it automatically forwards it here!
        changeOrigin: true,
      },
    },
  },
})