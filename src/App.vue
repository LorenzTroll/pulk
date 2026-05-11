<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useOverlayStore } from '@/stores/overlay'
import { destroyLenis, useLenis, getLenis } from '@/composables/useLenis.js'

import CookieBanner from '@/components/CookieBanner.vue'
import LandingPage from '@/views/LandingPage.vue'
import BottomMenu from '@/components/BottomMenu.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useHead } from '@vueuse/head'

const AboutModal = defineAsyncComponent(() =>
  import('@/components/AboutModal.vue')
)

const ContactModal = defineAsyncComponent(() =>
  import('@/components/ContactModal.vue')
)

const PricingModal = defineAsyncComponent(() =>
  import('@/components/PricingModal.vue')
)

useHead({
  meta: [
    // Windows Tile
    { name: 'msapplication-TileColor', content: '#9687FF' },
    { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
    { name: 'msapplication-config', content: '/browserconfig.xml' },

    // Chrome & Android Theme Color
    { name: 'theme-color', content: '#9687FF' },

    // App Name für Tiles/PWA
    { name: 'application-name', content: 'PULK' }
  ]
})

const overlay = useOverlayStore()
const router  = useRouter()

const showFooter = computed(() => {
  const current = router.currentRoute.value
  console.log('🧭 Aktuelle Route:', current.name, current.matched)

  return current?.matched?.length > 0 && current?.name !== 'NotFound' && current?.name !== 'preise' && current?.name !== 'anfragen'
})

const LEGAL_PATHS = ['/datenschutz', '/impressum']
let scrollY = 0
let localLenis = null

async function waitForLenisReady(maxTries = 20) {
  let tries = 0
  while (tries++ < maxTries) {
    const lenis = getLenis()
    if (lenis) return lenis
    await new Promise((r) => setTimeout(r, 50))
  }
  return null
}

function lockScroll() {
  scrollY = window.scrollY || window.pageYOffset || 0
  const sbw = window.innerWidth - document.documentElement.clientWidth
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
  document.documentElement.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
}

function unlockScroll() {
  const html = document.documentElement
  const body = document.body
  html.style.overflow = ''
  body.style.position = ''
  const top = parseInt(body.style.top || '0', 10) || 0
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.paddingRight = ''
  const targetY = -top || scrollY || 0
  window.scrollTo(0, targetY)
  const lenis = getLenis()
  if (lenis) {
    lenis.stop()
    requestAnimationFrame(() => {
      window.scrollTo(0, targetY)
      lenis.start()
      if (targetY > 0) lenis.scrollTo(targetY, { immediate: true })
    })
  }
}

// TEST safari-toolbar modals: statt body scroll-lock blenden wir #app
// aus, damit Window die Modal-Page scrollt → iOS Safari Toolbar reagiert
// auf Window-Scroll → Pille wird dynamisch.
// REVERT: { if (current) lockScroll(); else unlockScroll(); }
let savedModalScrollY = 0
watch(
  () => overlay.current,
  (current) => {
    const app = document.getElementById('app')
    if (current) {
      savedModalScrollY = window.scrollY || 0
      if (app) app.style.display = 'none'
      window.scrollTo(0, 0)
    } else {
      if (app) app.style.display = ''
      requestAnimationFrame(() => window.scrollTo(0, savedModalScrollY))
    }
  }
)

async function hardResetScroll() {
  if (overlay.current) return

  const html = document.documentElement
  const body = document.body

  localLenis = await waitForLenisReady()
  if (!localLenis) return

  html.style.overflow = ''
  html.style.height = ''
  body.style.overflow = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.paddingRight = ''
  body.style.touchAction = ''
  html.classList.remove('no-bounce-landing', 'lenis-scrolling', 'lenis')
  body.classList.remove('no-bounce', 'no-bounce-landing', 'lenis')

  const top = parseInt(body.style.top || '0', 10) || 0
  if (top) window.scrollTo(0, -top)

  try {
    localLenis.stop()
    await nextTick() // gibt DOM die Chance sich zu setzen
    localLenis.start()
    localLenis.resize()
    localLenis.emit?.('scroll')
    localLenis.emit?.('scrollEnd')
  } catch (e) {
    console.warn('Lenis restart failed:', e)
  }

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('scroll'))

    console.log('[DEBUG: hardResetScroll]')
    console.log('html.style.overflow:', html.style.overflow)
    console.log('body.style.position:', body.style.position)
    console.log('body.style.top:', body.style.top)
    console.log('window.scrollY:', window.scrollY)
    console.log('classList.html:', [...html.classList])
    console.log('classList.body:', [...body.classList])
  })

  setTimeout(() => {
    html.classList.remove('lenis-scrolling')

    console.log('[Lenis Check]')
    console.log('localLenis?.isStopped:', localLenis?.isStopped)
    console.log('localLenis?.scroll:', typeof localLenis?.scroll)
    console.log('localLenis?.isScrolling:', localLenis?.isScrolling)
    console.log('classList.html:', [...html.classList])
    console.log('window.scrollY:', window.scrollY)
  }, 250)
}


function onPageShow() {
  hardResetScroll()
}

function onVisChange() {
  if (document.visibilityState === 'visible') hardResetScroll()
}

/* --- Sitesight Tracking - robust, consent-gesteuert --- */
let sitesightLoading = false
let sitesightLoaded  = false

function waitForMDAL(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.MDAL && typeof window.MDAL.pageView === 'function') return resolve(window.MDAL)
      if (Date.now() - start > timeoutMs) return reject(new Error('MDAL timeout'))
      requestAnimationFrame(check)
    }
    check()
  })
}

function loadSitesight() {
  if (sitesightLoaded || sitesightLoading) return

  // WICHTIG: exakte Domain + Pfad prüfen
  const existing = document.querySelector('script[src*="app-static.sitesights.io/client.min.js"]')
  if (existing) {
    sitesightLoaded = true
    return
  }

  sitesightLoading = true
  const script = document.createElement('script')
  script.src = 'https://app-static.sitesights.io/client.min.js?v=1'
  script.defer = true
  // WICHTIG: exakt als data-website-uid setzen (nicht dataset.websiteUid)
  script.setAttribute('data-website-uid', 'igbssxU0LkGC4ff0oagssg')

  script.addEventListener('load', async () => {
    try {
      const mdal = await waitForMDAL()
      mdal.pageView({ Absolute: null, ClientId: null })
      sitesightLoaded = true
    } catch (err) {
      console.warn('[Sitesight] MDAL init timeout:', err)
    } finally {
      sitesightLoading = false
    }
  })

  script.addEventListener('error', () => {
    sitesightLoading = false
    console.error('[Sitesight] Script load error')
  })

  document.head.appendChild(script)
}

function checkConsentAndLoad() {
  const consent = localStorage.getItem('cookieConsent')
  if (consent === 'accepted') {
    loadSitesight()
  }
}

/** Reagiert, wenn Consent in anderem Tab geändert wurde */
function handleStorage(e) {
  if (e.key !== 'cookieConsent') return
  if (e.newValue === 'accepted') loadSitesight()
  if (e.newValue === 'rejected') window.location.reload()
}

/** Reagiert sofort im selben Tab (weil 'storage' hier nicht feuert) */
function handleLocalConsentChange() {
  checkConsentAndLoad()
}


onMounted(() => {
  console.log('[Mounted] waiting for Lenis...')

  checkConsentAndLoad()
  window.addEventListener('storage', handleStorage)
  window.addEventListener('cookie-consent-changed', handleLocalConsentChange)

router.afterEach((to, from) => {
  const isLegal = LEGAL_PATHS.includes(from.path) || LEGAL_PATHS.includes(to.path)
  const goesToLanding = (to.path === '/' || to.name === 'home' || to.name === 'landing')

  if (isLegal && goesToLanding) {
    console.log('[RouterTrigger] Returning from legal → LandingPage: Reset Lenis')

    destroyLenis()

    nextTick(() => {
      // Manuell neuen Lenis aktivieren
      const { lenis } = useLenis()
      lenis.value?.start?.()
      requestAnimationFrame(() => {
        lenis.value?.resize?.()
        lenis.value?.emit?.('scroll')
        window.dispatchEvent(new Event('scroll'))
      })
    })
  }
  checkConsentAndLoad()
})
  window.addEventListener('pageshow', onPageShow)
  window.addEventListener('visibilitychange', onVisChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('pageshow', onPageShow)
  window.removeEventListener('visibilitychange', onVisChange)
  window.removeEventListener('storage', handleStorage)
  window.removeEventListener('cookie-consent-changed', handleLocalConsentChange)
  unlockScroll()
})
</script>

<template>
  <div class="main-container relative" style="min-height: 100vh; min-height: 100dvh;">
    <router-view />
    <!-- About -->
    <AboutModal
      :visible="overlay.current === 'about'"
      @close="overlay.close"
    />
    <!-- Contact -->
    <ContactModal
      :visible="overlay.current === 'contact'"
      @close="overlay.close"
    />
    <!-- Pricing -->
    <PricingModal
      :visible="overlay.current === 'pricing'"
      @close="overlay.close"
    />
    <div id="end-sentinel" style="height:1px"></div>
    <SiteFooter
      v-if="showFooter"
      instagram-url="https://instagram.com/pulk.space"
      impressum-href="/impressum/"
      datenschutz-href="/datenschutz/"
      company="Pulk"
    />
    <CookieBanner />
  </div>
</template>

<style>
html, body { height: auto; }

body { touch-action: auto !important; }

html.no-bounce-landing,
body.no-bounce-landing {
  overscroll-behavior-y: contain;
  overscroll-behavior-x: auto;
}

html.lenis, html.lenis-smooth,
body.lenis, body.lenis-smooth {
  overflow-y: auto !important;
  overscroll-behavior-y: contain !important;
}
</style>