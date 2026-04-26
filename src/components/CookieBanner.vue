<script setup>
/* ============================================================================
 * Imports
 * ==========================================================================*/
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import chairImage from '@/assets/hero-chair-black.png?w=600&format=png&as=img'
import { getLenis } from '@/composables/useLenis'

gsap.registerPlugin(CSSPlugin)

/* ============================================================================
 * State
 * ==========================================================================*/
const showBanner = ref(false)
const route = useRoute()
const router = useRouter()

/* ============================================================================
 * Determine whether the banner should be shown
 * ==========================================================================*/
async function evaluateBanner() {
  const path = route.path.replace(/\/+$/, '')

  // Hide banner on the privacy page
  const isPrivacyPage =
    path === '/datenschutz' ||
    path.endsWith('/datenschutz/index.html')

  let consent = localStorage.getItem('cookieConsent')

  if (consent === 'null' || consent === 'undefined') {
    localStorage.removeItem('cookieConsent')
    consent = null
  }

  if (isPrivacyPage) {
    showBanner.value = false
    getLenis()?.start()
    return
  }

  // Show banner if no consent exists
  if (!consent) {
    showBanner.value = true
    await nextTick()

    // Stop scrolling while the banner is open
    getLenis()?.stop()
  }
}

/* ============================================================================
 * Lifecycle & watchers
 * ==========================================================================*/
onMounted(() => {
  setTimeout(evaluateBanner, 0) // sicher nach initialen DOM-Operations
})

watch(
  () => route.fullPath,
  () => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) evaluateBanner()
  }
)

/* ============================================================================
 * Consent handlers
 * ==========================================================================*/
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted')
  window.dispatchEvent(new Event('cookie-consent-changed'))
  showBanner.value = false
  getLenis()?.start()
}

function rejectCookies() {
  localStorage.setItem('cookieConsent', 'rejected')
  window.dispatchEvent(new Event('cookie-consent-changed'))
  showBanner.value = false
  getLenis()?.start()
}

/* ============================================================================
 * Navigate to privacy page; fade out banner before redirect
 * ==========================================================================*/
function openPrivacy(evt) {
  evt.preventDefault()

  getLenis()?.start()

  gsap.to(['.cookie-overlay', '.cookie-banner'], {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut'
  })

  showBanner.value = false

  setTimeout(() => {
    router.push('/datenschutz')
  }, 100)
}
</script>

<template>
  <div v-if="showBanner">
    <!-- Background blocker (prevents scrolling) -->
    <div
      class="cookie-overlay"
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      @wheel.prevent
      @touchmove.prevent
    />
    <!-- Cookie Banner -->
    <div
      class="cookie-banner"
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      @wheel.prevent
      @touchmove.prevent
    >
      <!-- Left: Title + Chair row -->
      <div class="banner-left">
        <h2 class="banner-title">Cookies</h2>
        <div class="chair-row" aria-hidden="true">
          <img :src="chairImage.src" alt="" class="chair-image" />
          <img :src="chairImage.src" alt="" class="chair-image" />
          <img :src="chairImage.src" alt="" class="chair-image" />
        </div>
      </div>
      <!-- Right: Text + Divider + Buttons -->
      <div class="banner-right">
        <p class="banner-text">
          Wir verwenden Cookies damit wir die Webseite Schritt für Schritt verbessern können.
          Und damit du bei uns das findest wonach du suchst. Um zu verstehen, wie ihr euch auf
          unserer Webseite zurechtfindet verwenden wir ein datenschutzfreundliches Analyse-Tool
          Sitesight (gehostet in der EU). Du kannst zustimmen oder einfach ohne Analyse
          weitermachen. Weitere Informationen findest du in unseren
          <a href="/datenschutz" class="privacy-link" @click="openPrivacy">Datenschutz-Richtlinien</a>.
        </p>
        <div class="banner-divider" aria-hidden="true"></div>
        <div class="banner-buttons">
          <button class="btn-text" @click="rejectCookies">
            Ohne Analyse fortfahren
          </button>
          <button class="btn-accept" @click="acceptCookies">
            Alle Akzeptieren
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
 * Overlay (blocks scroll & blurs background)
 * ==========================================================================*/
.cookie-overlay {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  touch-action: none;
  z-index: 2000;
}

/* ============================================================================
 * Cookie Banner
 *   Positionierung: zentriert, bottom 3.25rem
 *   Ziel-Abstand links/rechts zur Viewport-Kante: ~6rem (Kontrollwert)
 * ==========================================================================*/
.cookie-banner {
  box-sizing: border-box;
  position: fixed;
  bottom: 3.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100vw - 10rem);
  max-width: 130rem;
  background: #FFCC00;
  border-radius: 1.25rem;
  padding: 4.8125rem 5.8125rem 3.1875rem 3.8125rem;
  z-index: 3000;
  font-family: 'LayGrotesk', sans-serif;
  display: flex;
  gap: clamp(3rem, 7vw, 8.4375rem);
  align-items: flex-start;
}

.cookie-banner *, .cookie-banner *::before, .cookie-banner *::after {
  box-sizing: border-box;
}

/* ============================================================================
 * Left: Title + Chair row
 * ==========================================================================*/
.banner-left {
  flex: 0 0 auto;
  width: clamp(18rem, 25vw, 30rem);
  display: flex;
  flex-direction: column;
  gap: 1.875rem;
}

.banner-title {
  font-family: 'LayGrotesk', sans-serif;
  font-size: clamp(3.5rem, 6vw + 0.5rem, 5.625rem);
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1;
  margin: 0;
  color: #000;
}

.chair-row {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 0;
  width: 100%;
  transform: scaleX(-1);
}

.chair-image {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  height: auto;
  object-fit: contain;
  display: block;
  transform: scaleX(-1);
}

/* ============================================================================
 * Right: Text + Divider + Buttons
 * ==========================================================================*/
.banner-right {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2.4375rem;
}

.banner-text {
  font-family: 'LayGrotesk', sans-serif;
  font-size: clamp(1.0625rem, 0.9vw + 0.8rem, 1.5625rem);
  line-height: 1.32;
  letter-spacing: -0.01em;
  color: #141414;
  font-weight: 400;
  margin: 0;
}

.privacy-link {
  color: #141414;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.privacy-link:hover {
  color: #000;
}

.banner-divider {
  height: 0;
  border-top: 0.0625rem solid #141414;
  width: 100%;
}

/* ============================================================================
 * Buttons
 *   ⚠ Figma-Design: asymmetrisch (Text-Link vs. solider Button).
 *   DSGVO/EDPB 03/2022 bewertet das als Dark-Pattern. Umsetzung per Designvorgabe.
 * ==========================================================================*/
.banner-buttons {
  display: flex;
  gap: 2.3125rem;
  align-items: center;
  justify-content: flex-end;
}

.btn-text {
  font-family: 'LayGrotesk', sans-serif;
  background: none;
  border: none;
  padding: 0.625rem;
  font-size: clamp(1rem, 0.4vw + 0.85rem, 1.25rem);
  line-height: 1.6;
  letter-spacing: -0.01em;
  color: #141414;
  cursor: pointer;
  font-weight: 400;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-accept {
  font-family: 'LayGrotesk', sans-serif;
  background: #141414;
  color: #fff;
  border: none;
  border-radius: 0.625rem;
  padding: 0.8125rem 2.375rem 0.75rem 2.25rem;
  height: 3.5625rem;
  min-width: 13.3125rem;
  font-size: clamp(1rem, 0.4vw + 0.85rem, 1.25rem);
  line-height: 1.6;
  letter-spacing: -0.01em;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.btn-accept:hover {
  background: #000;
  transform: scale(1.015);
}

.btn-accept:active {
  transform: scale(0.99);
}

/* ============================================================================
 * Tablet (≤ 64rem)
 * ==========================================================================*/
@media (min-width: 40.0625rem) and (max-width: 64rem) {
  .cookie-banner {
    width: calc(100vw - 4rem);
    padding: 3rem 3rem 2.5rem;
    gap: 2.5rem;
    flex-direction: column;
    bottom: 2rem;
  }

  .banner-left {
    flex: 0 0 auto;
    width: 100%;
    flex-direction: row;
    align-items: flex-end;
    gap: 2rem;
  }

  .banner-title {
    flex: 1;
    font-size: clamp(3rem, 6vw, 4.5rem);
  }

  .chair-row {
    width: 55%;
    max-width: 22rem;
  }

  .banner-right {
    width: 100%;
  }
}

/* ============================================================================
 * Mobile (≤ 40rem)
 * ==========================================================================*/
@media (max-width: 40rem) {
  .cookie-banner {
    width: calc(100vw - 2rem);
    padding: 2rem 1.75rem;
    gap: 1.5rem;
    flex-direction: column;
    bottom: 1rem;
    border-radius: 1rem;
  }

  .banner-left {
    width: 100%;
  }

  .banner-title {
    font-size: 3rem;
  }

  .chair-row {
    display: none;
  }

  .banner-right {
    width: 100%;
    gap: 1.5rem;
  }

  .banner-text {
    font-size: 1rem;
  }

  .banner-buttons {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 1rem;
  }

  .btn-text {
    width: 100%;
    text-align: center;
  }

  .btn-accept {
    width: 100%;
    min-width: 0;
  }
}
</style>
