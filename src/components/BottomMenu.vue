<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'

import { useOverlayStore } from '@/stores/overlay'
import ArrowIcon from './ArrowIcon.vue'
import checkIcon from '@/assets/pulk_check-mark.svg'


/* -----------------------------------------------------------------------------
 * Stores / Router
 * ---------------------------------------------------------------------------*/
const router = useRouter()
const overlay = useOverlayStore()


/* -----------------------------------------------------------------------------
 * Element Refs
 * ---------------------------------------------------------------------------*/
const containerRef = ref(null)
const contactRef   = ref(null)
const aboutRef     = ref(null)
const pricingRef   = ref(null)

const allRefs = {
  contact: contactRef,
  about: aboutRef,
  pricing: pricingRef
}


/* -----------------------------------------------------------------------------
 * Main Click Handler for All Tabs
 * Controls open/close behavior + routing
 * ---------------------------------------------------------------------------*/
function handleClick(type) {
    const targetRoute = {
      contact: 'modalContact',
      about: 'modalAbout',
      pricing: 'modalPricing'
    }

  // Toggle same modal → close & reset
  if (overlay.current === type) {
    overlay.close()
    resetButtons()
    router.push({ name: 'home' })
    return
  }

  // Open new modal
  overlay.open(type)

  // Animate button stack (not for contact)
  if (type !== 'contact') {
    nextTick(() => animateStack(type))
  }

  router.push({ name: targetRoute[type] })
}

/* -----------------------------------------------------------------------------
 * Animation: "Stack" Movement (About / Pricing)
 * Moves inactive buttons towards center and fades them out
 * ---------------------------------------------------------------------------*/
function animateStack(activeKey) {
  const container = containerRef.value.getBoundingClientRect()

  Object.entries(allRefs).forEach(([key, refEl]) => {
    const el = refEl.value
    const box = el.getBoundingClientRect()
    const dx = container.left + container.width / 2 - (box.left + box.width / 2)
    const isActive = key === activeKey

    // Move + scale
    gsap.to(el, {
      x: dx,
      scale: 1,
      zIndex: isActive ? 2001 : 1001,
      duration: 0.2,
      ease: 'power1.out'
    })

    // Fade others
    gsap.to(el, {
      opacity: isActive ? 1 : 0,
      duration: 0.4,
      ease: 'power2.out'
    })
  })
}

/* -----------------------------------------------------------------------------
 * Reset Buttons (when modal closes)
 * ---------------------------------------------------------------------------*/
function resetButtons() {
  Object.values(allRefs).forEach(refEl => {
    const el = refEl.value
    const tl = gsap.timeline()

    tl.to(el, {
      x: 0,
      scale: 1,
      zIndex: 1001,
      duration: 0.2,
      ease: 'power1.out'
    })
    tl.to(el, {
      opacity: 1,
      duration: 0.5,
      ease: 'power1.out'
    }, '-=0.2')
  })
}

/* -----------------------------------------------------------------------------
 * Button Morph Animation
 * (Mieten ↔ Abgesendet)
 * ---------------------------------------------------------------------------*/
watch(
  () => overlay.feedback,
  async val => {
    await nextTick()

    const btn     = contactRef.value
    if (!btn) return

    const textEl  = btn.querySelector('.btn-text')
    const iconEl  = btn.querySelector('.icon')
    const arrowEl = iconEl?.querySelector('svg')
    const checkEl = iconEl?.querySelector('.check-icon')

    const TEXT_INITIAL = 'Mieten'
    const TEXT_SENT    = 'Abgesendet'

    // Measure + freeze width
    const freezeWidth = () => {
      const w = Math.ceil(btn.getBoundingClientRect().width)
      gsap.set(btn, { width: w })
      return w
    }

    // Measure width for text change
    const measureAutoWidth = nextText => {
      const prev = textEl.textContent
      textEl.textContent = nextText

      gsap.set(btn, { width: 'auto' })
      const w = Math.ceil(btn.getBoundingClientRect().width)

      textEl.textContent = prev
      return w
    }

    // Build GSAP morph animation
    const animateTo = ({ nextText, showCheck }) => {
      const w0 = freezeWidth()
      const w1 = measureAutoWidth(nextText)

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

      // Fade out text
      tl.to(textEl, { y: -14, opacity: 0, duration: 0.2 }, 0)

      // Swap text
      tl.add(() => { textEl.textContent = nextText })

      // Fade in text
      tl.fromTo(textEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28 }, '<0.05')

      // Width tween
      tl.fromTo(btn, { width: w0 }, { width: w1, duration: 0.32 }, 0)

      // Arrow ↔ Check icon
      if (showCheck) {
        tl.to(arrowEl, { opacity: 0, scale: 0.8, duration: 0.18 }, 0)
        tl.to(checkEl, { opacity: 1, scale: 1, duration: 0.22 }, '<0.05')
      } else {
        tl.to(checkEl, { opacity: 0, scale: 0.8, duration: 0.18 }, 0)
        tl.to(arrowEl, { opacity: 1, scale: 1, duration: 0.22 }, '<0.05')
      }

      // Reset width back to auto
      tl.add(() => { gsap.set(btn, { width: 'auto' }) })

      return tl
    }

    // → Animate to "sent"
    if (val === 'submitted') {
      const tl = animateTo({ nextText: TEXT_SENT, showCheck: true })
      tl.eventCallback('onComplete', () => {
        gsap.delayedCall(5, () => { overlay.feedback = null })
      })
      tl.play()
    }

    // → Animate back to "Mieten"
    if (val === null) {
      animateTo({ nextText: TEXT_INITIAL, showCheck: false }).play()
    }
  }
)

/* -----------------------------------------------------------------------------
 * Tracking Helpers
 * ---------------------------------------------------------------------------*/
function trackAndClick(target) {
  if (window.MDAL?.event) {
    const isClosing = overlay.current === target

    MDAL.event({
      Name: 'bottommenu-click',
      Parameters: [
        { Name: 'button', Value: target },
        { Name: 'action', Value: isClosing ? 'close' : 'open' }
      ]
    })
  }

  handleClick(target)
}

function trackSubmit() {
  if (window.MDAL?.event) {
    MDAL.event({
      Name: 'modal-button-click',
      Parameters: [{ Name: 'target', Value: 'submit' }]
    })
  }
  window.dispatchEvent(new Event('submit-contact'))
}

function trackCloseContact() {
  if (window.MDAL?.event) {
    MDAL.event({
      Name: 'contactmodal-abort',
      Parameters: [{ Name: 'via', Value: 'close-button' }]
    })
  }

  handleClick('contact')
}

/* -----------------------------------------------------------------------------
 * Label for Morph Button (unused by template but kept)
 * ---------------------------------------------------------------------------*/
const buttonLabel = computed(() => {
  if (overlay.feedback === 'submitted') {
    return { text: 'Abgeschickt', icon: 'check' }
  }
  return { text: 'Mieten', icon: 'arrow' }
})

function trackCloseContactModal() {
  // Nur tracken, wenn das Modal gerade offen ist
  if (overlay.current === 'contact') {
    if (window.MDAL?.event) {
      MDAL.event({
        Name: 'modal-abort',
        Parameters: [
          { Name: 'modal', Value: 'contact' },
          { Name: 'action', Value: 'close-button' }
        ]
      })
    }
  }

  // Dann normales Verhalten ausführen
  handleClick('contact')
}
</script>

<template>
  <!-- -----------------------------------------------------------------------
       Contact Mode: "Submit" + "Close"
       --------------------------------------------------------------------- -->
  <nav
    v-if="overlay.current === 'contact'"
    class="bottom-menu"
  >
    <button
      class="tab submit-tab"
      :disabled="!overlay.isContactValid"
      @click="trackSubmit"
    >
      Abschicken
    </button>
    <button
      class="tab contact"
      ref="contactRef"
      @click="trackCloseContact"
    >
      <span>Schließen</span>
      <span class="icon">✕</span>
    </button>
  </nav>
  <!-- -----------------------------------------------------------------------
       Default Mode: Three Tabs
       Includes Morph Button (Mieten ↔ Abgesendet)
       --------------------------------------------------------------------- -->
  <nav
    v-else
    class="bottom-menu"
    ref="containerRef"
  >
    <!-- Morph Button -->
    <button
      class="tab contact"
      ref="contactRef"
      @click="handleClick('contact')"
    >
      <span class="btn-text">Anfragen</span>
      <span class="icon">
        <ArrowIcon class="arrow-icon" />
        <img
          :src="checkIcon"
          alt="✓"
          class="check-icon"
        />
      </span>
    </button>
    <!-- About -->
    <button
      class="tab about"
      ref="aboutRef"
      @click="handleClick('about')"
    >
      <span>{{ overlay.current === 'about' ? 'Schließen' : 'About' }}</span>
      <span class="icon">
        <span v-if="overlay.current === 'about'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>
    <!-- Pricing -->
    <button
      class="tab pricing"
      ref="pricingRef"
      @click="handleClick('pricing')"
    >
      <span>{{ overlay.current === 'pricing' ? 'Schließen' : 'Preise' }}</span>
      <span class="icon">
        <span v-if="overlay.current === 'pricing'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>
  </nav>
</template>

<style scoped>
/* -----------------------------------------------------------------------------
 * Shared Button Text
 * ---------------------------------------------------------------------------*/
.btn-text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: middle;
  transition: color 0.3s ease;
}

/* -----------------------------------------------------------------------------
 * Icon Container
 * ---------------------------------------------------------------------------*/
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 0.6rem;
}

/* Arrow SVG + Check Icon (shared size) */
.icon svg,
.icon img {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}

/* Check icon sits on top of arrow, invisible by default */
.check-icon {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

/* -----------------------------------------------------------------------------
 * Bottom Menu Layout
 * ---------------------------------------------------------------------------*/
.bottom-menu {
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2000;
}

/* -----------------------------------------------------------------------------
 * Tabs
 * ---------------------------------------------------------------------------*/
.tab {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

/* Colors for normal state */
.tab.contact { background: #eef1f6; color: #000; }
.tab.about   { background: #000;    color: #fff; }
.tab.pricing { background: #ed6a1c; color: #fff; }

/* Submit button in contact mode */
.submit-tab {
  background: #000;
  color: #fff;
}

/* Disabled submit */
.submit-tab:disabled {
  background: #ccc !important;
  color: #666 !important;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Hover */
.tab:hover,
.submit-tab:hover {
  transform: scale(1.05);
}

/* -----------------------------------------------------------------------------
 * Mobile Adjustments
 * ---------------------------------------------------------------------------*/
@media (max-width: 640px) {
  .bottom-menu {
    gap: 0.5rem;
    bottom: 2rem;
  }

  .tab {
    padding: 1rem 1rem; 
    font-size: 0.95rem;
    gap: 0.5rem;
  }
  
  .submit-tab {
    padding: 1rem 1rem; 
    font-size: 0.95rem;  
  }

  .icon svg,
  .icon img {
    width: 0.85rem;
    height: 0.85rem;
  }
}

</style>
