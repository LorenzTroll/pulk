<script setup>
/* ============================================================================
 * Imports
 * ============================================================================ */
import { useHead } from '@vueuse/head'
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLenis } from '@/composables/useLenis.js'

/* ============================================================================
 * SEO Metadata
 * ============================================================================ */
useHead({
  title: 'Impressum · PULK',
  meta: [
    { name: 'description', content: 'Impressum von PULK – Anbieterkennzeichnung gemäß § 5 TMG.' },
    { name: 'robots', content: 'noindex,follow' }
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
})

/* ============================================================================
 * Cleanup
 * ============================================================================ */
onBeforeUnmount(() => {
  document.body.classList.remove('theme-plain')
  document.documentElement.classList.remove('no-bounce-landing', 'lenis-stopped')
  document.body.classList.remove('no-bounce-landing')
  document.getElementById('app')?.classList.remove('plain-background')
})
</script>

<template>
  <main class="legal-wrap">
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
        <a href="mailto:kontakt@pulk.space">kontakt@pulk.de</a>
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
    <!-- Back Button -->
    <div class="back-home-wrapper">
      <RouterLink to="/" class="back-home-btn">
        Zurück zur Startseite
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * Page Wrapper
 * ============================================================================ */
.legal-wrap {
  max-width: 75%;
  margin: 0 auto 40rem;
  padding: 5rem 0 0 0;
  background: #fff;
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
  font-size: clamp(2.7rem, 3vw, 3rem);
  margin: 0 0 2rem;
  text-transform: uppercase;
  text-align: center;
  text-wrap: balance;
}

/* ============================================================================
 * Body Content
 * ============================================================================ */
.legal-body {
  padding: 3rem 0 0;
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #141414;
}

address {
  font-style: normal !important;
}

.legal-body a {
  color: #141414;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ============================================================================
 * Back-to-home Button
 * ============================================================================ */
.back-home-wrapper {
  margin-top: 6rem;
  text-align: center;
}

.back-home-btn {
  background-color: #9687FF;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  text-decoration: none;
  transition: background-color 0.25s ease, transform 0.2s ease;
  display: inline-block;
}

.back-home-btn:hover {
  background-color: #7e6fe0;
  transform: translateY(-2px);
}

/* ============================================================================
 * Mobile Layout
 * ============================================================================ */
@media (max-width: 640px) {
  .legal-wrap {
    max-width: 92%;
    padding: 3rem 0 6rem;
  }

  .legal-header h1 {
    font-size: clamp(2rem, 5vw, 2.7rem);
    margin: 1rem 0 2rem;
  }

  .legal-body {
    font-size: clamp(1rem, 4vw, 1.2rem);
    line-height: 1.65;
  }
}
</style>
