import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En dev, les appels API passent par ce proxy pour éviter le blocage CORS du back
// (le back n'autorise que certaines origines, pas localhost:5174).
const proxy = {
  target: 'https://backsignup.h-tsoft.com',
  changeOrigin: true,
  secure: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxy,
      '/graphql': proxy,
    },
  },
})
