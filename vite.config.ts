import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE_PATH || '/hetu-luoshu/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 950,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'scene-vendor', test: /node_modules[\\/](@react-three|three-stdlib|gsap)[\\/]/ },
          ],
        },
      },
    },
  },
})
