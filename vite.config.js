// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { imagetools } from 'vite-imagetools'
import path from 'path'

export default defineConfig({
  cacheDir: '.vite-cache',
  server: {
    hmr: {
      overlay: false
    }
  },
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
  },
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps, ctx) => {
        if (ctx?.hostType !== 'html') return deps
        return deps.filter(dep =>
          !/\/(calendar|gl|icons|AboutModal|ContactModal|PricingModal|AboutPage|ContactPage|PricingPage)-/i.test(dep)
        )
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          head: ['@unhead/vue', '@vueuse/head'],
          gsap: ['gsap'],
          scroll: ['lenis', '@studio-freight/lenis', 'locomotive-scroll'],
          gl: ['ogl'],
          icons: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/vue-fontawesome'
          ],
          calendar: ['hkanev-vue-calendar']
        }
      }
    }
  }
})
