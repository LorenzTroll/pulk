<script setup>
/* ============================================================================
 * Imports
 * ==========================================================================*/
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import chairImage from '@/assets/chair-cookie-banner_E3.png?w=800&format=png&as=img'
import { getLenis } from '@/composables/useLenis'

gsap.registerPlugin(CSSPlugin)

/* ============================================================================
 * State
 * ==========================================================================*/
const showBanner = ref(false)
const route = useRoute()

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

    // Soft background animation
    gsap.fromTo(
      '.cookie-overlay',
      { backdropFilter: 'blur(15px) saturate(120%)' },
      { backdropFilter: 'blur(30px) saturate(150%)', duration: 0.7, ease: 'power2.out' }
    )

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
}

function rejectCookies() {
  localStorage.setItem('cookieConsent', 'rejected')
  window.dispatchEvent(new Event('cookie-consent-changed'))
  showBanner.value = false
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
    window.location.href = '/datenschutz'
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
      <div class="content">
        <!-- Left side -->
        <div class="left">
          <h2>Cookies</h2>
          <img :src="chairImage.src" alt="Stuhl" class="chair-image" />
        </div>
        <!-- Right side -->
        <div class="right">
          <p class="cookie-paragaph">
            Damit Du alles findest, was du an Infos benötigst und wir die Webseite Schritt für Schritt verbessern können.
            Funktionale Cookies sind notwendig. Um zu verstehen, wie sich die User:innen auf unserer Webseite verhalten,
            verwenden wir das datenschutzfreundliche Analyse-Tool Sitesight (gehostet in der EU).
            Weitere Informationen findest du in unseren
            <a href="/datenschutz" class="privacy-link" @click="openPrivacy">Datenschutz-Richtlinien</a>
          </p>
          <div class="buttons">
            <button class="btn secondary" @click="rejectCookies">
              Ohne Analyse fortfahren
            </button>
            <button class="btn primary" @click="acceptCookies">
              Akzeptieren
            </button>
          </div>
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
  backdrop-filter: blur(5px) saturate(100%);
}

/* ============================================================================
 * Cookie Banner
 * ==========================================================================*/
.cookie-banner {
  position: fixed;
  bottom: 3%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  min-width: 80vw;
  background: #D9D9D9;
  border-radius: 1rem;
  padding: 3.5rem;
  z-index: 3000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'LayGrotesk', sans-serif;
}

.cookie-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 24.5%;
  height: 100%;
  background: #F2B607;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  z-index: 0;
}

/* ============================================================================
 * Layout inside banner
 * ==========================================================================*/
.content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.left {
  display: flex;
  flex-direction: row;
  gap: 0;
}

.left h2 {
  font-size: clamp(2rem, 1.8vw + 1.2rem, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.06rem;
  margin: 0.5rem 0 1rem;
  z-index: 1;
}

.chair-image {
  width: clamp(15rem, 30vw, 25rem);
  object-fit: contain;
  margin: -2rem 0 -1rem;
  max-width: 100%;
  transform: translateX(-1rem);
  z-index: 2;
}

/* Right column */
.right {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.right p {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 0.09rem solid #0C0C0C;
  width: 90%;
  align-self: flex-end;
}

/* Privacy link */
.privacy-link {
  color: #7b61ff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.privacy-link:hover {
  color: #a48cff;
  text-decoration: underline;
}

/* Buttons */
.buttons {
  display: flex;
  width: 100%;
  padding-top: 7%;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  font-family: 'LayGrotesk', sans-serif;
  padding: 0.8rem 1.6rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

.btn.primary {
  background: #000;
  color: #fff;
}

.btn.secondary {
  background: transparent;
  border: 1px solid #000;
  color: #000;
}

/* ============================================================================
 * Tablet
 * ==========================================================================*/
@media (max-width: 1200px) and (min-width: 769px) {
  .left {
    flex-direction: column;
    align-items: flex-start;
  }

  .chair-image {
    width: 18rem;
    margin-top: 0.5rem;
  }

  .cookie-banner {
    width: min(80vw, 95rem);
    bottom: 4%;
  }

  .cookie-banner::before {
    width: 28%;
  }

  .right p {
    width: 97%;
  }
}

/* ============================================================================
 * Mobile
 * ==========================================================================*/
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }

  .cookie-banner {
    width: 75%;
    padding: 2.5rem;
  }

  .cookie-banner::before {
    display: none;
  }

  .left {
    align-items: center;
    flex-direction: column-reverse;
  }

  .chair-image {
    display: none;
  }

  .left h2 {
    font-size: 2.5rem;
    padding-bottom: 2rem;
    align-self: flex-start;
  }

  .right p {
    width: 100%;
    border-bottom: none;
    padding-left: 1rem;
    padding-bottom: 1rem;
  }

  .buttons {
    flex-direction: column-reverse;
    align-self: center;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
