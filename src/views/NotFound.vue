<script setup>
/* ============================================================================
 * Imports
 * ==========================================================================*/
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useLenis } from '@/composables/useLenis.js'
import pulkLogo from '@/assets/pulk-logo-landingpage.svg'
import { useHead } from '@vueuse/head'
import { track } from '@/utils/tracking'

/* ============================================================================
 * Meta Tags / SEO
 * ==========================================================================*/
useHead({
  title: 'Seite nicht gefunden · PULK Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'Diese Seite gibt es nicht oder wurde verschoben. Zurück zur Startseite von PULK – Raum für Workshops in Halle (Saale).'
    },
    { name: 'robots', content: 'noindex,follow' },

    // Open Graph
    { property: 'og:title', content: 'Seite nicht gefunden · PULK Halle (Saale)' },
    {
      property: 'og:description',
      content:
        'Diese Seite gibt es nicht oder wurde verschoben. Zurück zur Startseite von PULK – Raum für Workshops in Halle (Saale).'
    },
    { property: 'og:url', content: 'https://pulk.space/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Raum in Halle (Saale)' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Seite nicht gefunden · PULK Halle (Saale)' },
    {
      name: 'twitter:description',
      content:
        'Diese Seite gibt es nicht oder wurde verschoben. Zurück zur Startseite von PULK.'
    },
    { name: 'twitter:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' }
  ]
})

/* ============================================================================
 * State & Lenis
 * ==========================================================================*/
const { lenis } = useLenis()
const rootRef = ref(null)

/* ============================================================================
 * Lifecycle: Enable Lenis and hide footer on mount
 * ==========================================================================*/
onMounted(() => {
  document.getElementById('app')?.classList.add('hide-footer')

  track('pulk.page.404', {
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof document !== 'undefined' ? document.referrer : ''
  })

  // Ensure Lenis starts and reads layout
  lenis.value?.start?.()
  lenis.value?.resize?.()

  requestAnimationFrame(() => {
    lenis.value?.emit?.('scroll')
    window.dispatchEvent(new Event('scroll'))
  })
})

/* ============================================================================
 * Lifecycle: Restore footer visibility
 * ==========================================================================*/
onBeforeUnmount(() => {
  document.getElementById('app')?.classList.remove('hide-footer')
})
</script>

<template>
  <main class="notfound-wrap" ref="rootRef">
    <!-- Header: Logo -->
    <header class="notfound-header">
      <img :src="pulkLogo" alt="PULK Logo" class="pulk-logo" />
    </header>

    <!-- Content Box -->
    <section class="notfound-box">
      <!-- Left: Text + Startseite Button -->
      <div class="notfound-left">
        <p class="notfound-text">
          Ups! Hier gibt’s nichts zu sehen. Bitte überprüfe die URL oder kehre zu unserer
          Startseite zurück. Falls du glaubst, dass hier ein Fehler vorliegt, dann schreib uns
          gerne eine email an:
          <a href="mailto:kontakt@pulk.space?subject=Bug%20Report%20Pulk%20Webseite">
            kontakt@pulk.space
          </a>.
        </p>
        <RouterLink to="/" class="notfound-btn">Startseite</RouterLink>
      </div>

      <!-- Middle: 404 / not found -->
      <div class="notfound-code-box">
        <span class="notfound-code-top">404</span>
        <span class="notfound-code-bottom">not found</span>
      </div>

      <!-- Right: Warning Pictogram -->
      <div class="notfound-icon-box">
        <img src="@/assets/404-Pictogram_E2.svg" alt="Warnsymbol" class="notfound-icon-img" />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ============================================================================
 * Main Layout
 * ==========================================================================*/
.notfound-wrap {
  min-height: 100dvh;
  background-color: #ff5234;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(3rem, 6vw, 6.0625rem) clamp(1.5rem, 6vw, 6.75rem) 3.5rem;
  font-family: 'LayGrotesk', sans-serif;
  color: #141414;
}

.notfound-wrap *,
.notfound-wrap *::before,
.notfound-wrap *::after {
  box-sizing: border-box;
}

/* ============================================================================
 * Header (Logo + pulk.space pill)
 * ==========================================================================*/
.notfound-header {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 1vw, 1rem);
}

.pulk-logo {
  height: clamp(3rem, 5vw, 6.5rem);
  width: auto;
  display: block;
}

/* ============================================================================
 * Content Box (gray container with 3 areas)
 * ==========================================================================*/
.notfound-box {
  background-color: #d9d9d9;
  border-radius: 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  padding: 1rem 0.9375rem 1.0625rem 3rem;
  height: clamp(20rem, 22vw, 26rem);
}

/* ============================================================================
 * Left column: Text + Button
 * ==========================================================================*/
.notfound-left {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(1rem, 2vw, 4.4375rem) 2rem 1rem 0rem;
}

.notfound-text {
  font-family: 'LayGrotesk', sans-serif;
  font-size: clamp(1rem, 1.2vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  font-weight: 400;
  margin: 0;
  max-width: 95%;
}

.notfound-text a {
  color: #141414;
  text-decoration: underline;
  font-weight: 600;
}

.notfound-btn {
  margin-top: auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #141414;
  color: #fff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1rem, 0.4vw + 0.85rem, 1.25rem);
  line-height: 1.6;
  letter-spacing: -0.01em;
  padding: 0 1.5rem;
  height: 3.5625rem;
  min-width: 10.0625rem;
  border-radius: 0.625rem;
  text-decoration: none;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.notfound-btn:hover {
  background-color: #000;
  transform: scale(1.015);
}

.notfound-btn:active {
  transform: scale(0.99);
}

/* ============================================================================
 * 404 / not found box
 * ==========================================================================*/
.notfound-code-box {
  flex: 0 0 auto;
  aspect-ratio: 1 / 1;
  background-color: #141414;
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: 'LayGrotesk', sans-serif;
  color: #d9d9d9;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1;
  text-align: center;
}

.notfound-code-top,
.notfound-code-bottom {
  font-size: clamp(1.75rem, 3vw, 3.6458rem);
  line-height: 1.23;
}

/* ============================================================================
 * Icon box (warning pictogram)
 * ==========================================================================*/
.notfound-icon-box {
  flex: 0 0 auto;
  aspect-ratio: 1 / 1;
  background-color: #141414;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 2vw, 2.5rem);
}

.notfound-icon-img {
  width: 66.6667%;
  height: auto;
  display: block;
}

/* ============================================================================
 * Tablet (≤ 64rem)
 * ==========================================================================*/
@media (max-width: 64rem) {
  .notfound-wrap {
    padding: clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem) clamp(2rem, 4vw, 3rem);
    gap: clamp(3rem, 8vw, 6rem);
  }

  .notfound-box {
    height: auto;
    padding: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .notfound-left {
    flex: 1 1 100%;
    padding: 1.5rem 1rem 0.5rem;
    max-width: none;
    gap: 2rem;
  }

  .notfound-code-box,
  .notfound-icon-box {
    flex: 1 1 0;
    aspect-ratio: 1 / 1;
    max-width: calc(50% - 0.5rem);
    max-height: 18rem;
  }

  .notfound-code-top,
  .notfound-code-bottom {
    font-size: clamp(1.75rem, 4vw, 3rem);
  }

  .notfound-icon-box {
    padding: clamp(1.5rem, 4vw, 3rem);
  }
}

/* ============================================================================
 * Mobile (≤ 40rem)
 * ==========================================================================*/
@media (max-width: 40rem) {
  .notfound-wrap {
    padding: 2rem 1rem;
    gap: 2rem;
  }

  .notfound-header {
    gap: 0.75rem;
  }

  .pulk-logo {
    height: 3rem;
  }

  .notfound-box {
    flex-direction: column;
    padding: 1.25rem;
    gap: 1rem;
  }

  .notfound-left {
    padding: 1rem 0.5rem;
    gap: 2rem;
  }

  .notfound-text {
    font-size: 1rem;
  }

  .notfound-code-box,
  .notfound-icon-box {
    width: 100%;
    max-width: none;
    aspect-ratio: 1 / 1;
    max-height: none;
    min-width: 0;
    flex: 1 1 auto;
  }

  .notfound-btn {
    width: 100%;
  }
}
</style>
