import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@headlessui/react', 'lucide-react'],
          'charts': ['recharts'],
          'utils': ['axios', 'date-fns', 'socket.io-client']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
})
