// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { imagetools } from 'vite-imagetools'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    imagetools({
      defaultDirectives: () => new URLSearchParams({
        format: 'avif;webp;jpg',
        quality: '75'
      })
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
