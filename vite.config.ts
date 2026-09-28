import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // three.js is deliberately loaded as its own cached chunk
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('/three/') || id.includes('@react-three')) return 'three'
            if (id.includes('framer-motion') || id.includes('motion-dom')) return 'motion'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler'))
              return 'react'
          }
        },
      },
    },
  },
})
