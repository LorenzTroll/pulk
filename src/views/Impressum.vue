<script setup>
/* ============================================================================
 * Imports
 * ============================================================================ */
import { useHead } from '@vueuse/head'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLenis } from '@/composables/useLenis.js'

/* ============================================================================
 * SEO Metadata
 * ============================================================================ */
useHead({
  title: 'Impressum · PULK – Raum in Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'Impressum und Anbieterkennzeichnung gemäß § 5 TMG für pulk.space – Kontaktinformationen der Betreiber des PULK Raums in Halle (Saale).'
    },
    { name: 'robots', content: 'noindex,follow' },

    // Open Graph
    { property: 'og:title', content: 'Impressum · PULK' },
    {
      property: 'og:description',
      content:
        'Impressum und Anbieterkennzeichnung gemäß § 5 TMG für pulk.space – Kontaktinformationen der Betreiber des PULK Raums in Halle (Saale).'
    },
    { property: 'og:url', content: 'https://pulk.space/impressum' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Raum in Halle (Saale)' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Impressum · PULK' },
    {
      name: 'twitter:description',
      content:
        'Impressum und Anbieterkennzeichnung gemäß § 5 TMG für pulk.space.'
    },
    { name: 'twitter:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://pulk.space/impressum' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LegalService",
        name: "PULK",
        url: "https://pulk.space/impressum",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Talstraße 7",
          addressLocality: "Halle (Saale)",
          postalCode: "06120",
          addressCountry: "DE"
        },
        email: "kontakt@pulk.space"
      })
    }
  ]
})

/* ============================================================================
 * Lenis Setup
 * ============================================================================ */
const { lenis } = useLenis()

/* ============================================================================
 * Footer-Lift für fixed Close-Button
 * ============================================================================ */
const footerSentinelRef = ref(null)
const btnLift = ref(0)

function updateLift() {
  const footer = document.querySelector('.site-footer')
  if (!footer) return
  const rect = footer.getBoundingClientRect()
  const vh = window.innerHeight
  btnLift.value = Math.max(0, vh - rect.top)
}

onMounted(async () => {
  /* Start Lenis safely */
  try {
    lenis.value?.start?.()
    requestAnimationFrame(() => {
      lenis.value?.resize?.()
      lenis.value?.emit?.('scroll')
      window.dispatchEvent(new Event('scroll'))
    })
  } catch (err) {
    console.warn('[Impressum] Lenis start/resize failed:', err)
  }

  await nextTick()

  /* Handle hash navigation (e.g. /impressum#kontakt) */
  const hash = decodeURIComponent(location.hash || '').replace('#', '')
  if (hash) {
    const el = document.getElementById(hash)
    if (el) {
      lenis.value?.scrollTo(el, { offset: -40, immediate: false })
    }
  }

  /* Activate plain layout background */
  document.getElementById('app')?.classList.add('plain-background')

  window.addEventListener('scroll', updateLift, { passive: true })
  updateLift()
})

/* ============================================================================
 * Cleanup
 * ============================================================================ */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateLift)
  document.body.classList.remove('theme-plain')
  document.documentElement.classList.remove('no-bounce-landing', 'lenis-stopped')
  document.body.classList.remove('no-bounce-landing')
  document.getElementById('app')?.classList.remove('plain-background')
})
</script>

<template>
  <main class="legal-wrap" style="background-color: #e7e8ec; min-height: 100dvh;">
    <!-- Header -->
    <header class="legal-header">
      <h1>Impressum</h1>
    </header>
    <!-- Legal Content -->
    <section class="legal-body">
      <p>Angaben gemäß § 5 TMG / § 18 MStV:</p>
      <address>
        <strong>
          Michel Klehm und Lorenz Troll GbR<br />
          Talstraße 7<br />
          DE-06120 Halle (Saale)<br />
        </strong>
      </address>
      <p>
        Vertretungsberechtigt: Michel Klehm, Lorenz Troll<br>
        Umsatzsteuer-ID: 110/172/00692
      </p>
      <p>
        E-Mail:
        <a href="mailto:kontakt@pulk.space">kontakt@pulk.space</a>
      </p>
      <p>
        Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV:<br>
        Michel Klehm, Lorenz Troll (Anschrift wie oben)
      </p>
      <p>
        Plattform der EU-Kommission zur Online-Streitbeilegung:<br>
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>.<br>
        Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren
        <br>vor einer Verbraucherschlichtungsstelle teilzunehmen.<br />
      </p>
    </section>

    <!-- Footer sentinel — lets close button lift above the footer -->
    <div ref="footerSentinelRef" class="ds-sentinel"></div>
  </main>

  <!-- Fixed close button -->
  <RouterLink
    to="/"
    class="ds-close-btn"
    :style="{ bottom: `calc(2rem + env(safe-area-inset-bottom, 0px) + ${btnLift}px)` }"
  >
    <span>Schließen</span>
    <span class="ds-close-icon">✕</span>
  </RouterLink>
</template>

<style scoped>
/* ============================================================================
 * Page Wrapper
 * ============================================================================ */
.legal-wrap {
  max-width: 75%;
  margin: 0 auto 35rem;
  padding: 5rem 0 0 0;
  background: #e7e8ec;
  color: #141414;
  font-family: 'LayGrotesk', sans-serif;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: auto;
}

/* ============================================================================
 * Header
 * ============================================================================ */
.legal-header h1 {
  font-weight: 900;
  font-size: clamp(2rem, 6vw, 3rem);
  margin: 0 0 2rem;
  text-align: center;
  text-wrap: balance;
}

/* ============================================================================
 * Body Content
 * ============================================================================ */
.legal-body {
  padding: 1rem 0 3rem;
  text-align: center;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
}

address {
  font-style: normal !important;
}

.legal-body a {
  color: #141414;
  text-decoration: underline;
  text-underline-offset: 0.125rem;
}

/* ============================================================================
 * Sentinel + Fixed Close Button
 * ============================================================================ */
.ds-sentinel {
  height: 0;
}

.ds-close-btn {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  transition: bottom 0.3s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  background: #9687FF;
  color: #fff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  z-index: 2000;
  white-space: nowrap;
}

.ds-close-btn:hover {
  transform: translateX(-50%) scale(1.05);
}

/* ============================================================================
 * Mobile Layout (≤ 40rem)
 * ============================================================================ */
@media (max-width: 40rem) {
  .legal-wrap {
    max-width: 92%;
    padding: 3rem 0 6rem;
  }

  .legal-header h1 {
    font-size: clamp(2rem, 7vw, 2.5rem);
    margin: 1rem 0 2rem;
  }

  .legal-body {
    font-size: clamp(1rem, 4vw, 1.25rem);
    line-height: 1.65;
  }
}
</style>
