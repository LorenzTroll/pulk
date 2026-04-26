// /src/composables/useLenis.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Lenis from 'lenis'

const _lenisRef = ref(null)
let _rafId = 0

// Touch-Geräte (iOS/Android) nutzen nativen Scroll:
// Lenis syncTouch ist v1.3 standardmäßig aus, bringt also keinen Mehrwert,
// kann aber via `lenis-stopped` Klasse Scroll blockieren.
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0) ||
    window.matchMedia?.('(pointer: coarse)').matches
  )
}

export function useLenis(options = {}) {
  onMounted(() => {
    // Auf Touch-Geräten Lenis komplett überspringen — native Scrolling.
    if (isTouchDevice()) return

    if (_lenisRef.value) {
      // Singleton existiert — RAF neu starten falls er durch onBeforeUnmount gestoppt wurde
      if (!_rafId) {
        const lenis = _lenisRef.value
        const raf = (time) => {
          lenis.raf(time)
          _rafId = requestAnimationFrame(raf)
        }
        _rafId = requestAnimationFrame(raf)
      }
      return
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const baseOpts = prefersReduced
      ? { smooth: false }
      : {
          duration: 0.4,
          easing: (t) => 1 - Math.pow(1 - t, 2),
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.8,
          touchMultiplier: 0.7,
          ...options,
        }

    const lenis = new Lenis(baseOpts)
    _lenisRef.value = lenis

    const raf = (time) => {
      lenis.raf(time)
      _rafId = requestAnimationFrame(raf)
    }
    _rafId = requestAnimationFrame(raf)
  })

  onBeforeUnmount(() => {
    if (_rafId) cancelAnimationFrame(_rafId)
    _rafId = 0
    // Singleton bleibt bestehen (nicht nullen!)
  })

  return {
    lenis: _lenisRef,
    on: (evt, cb) => _lenisRef.value?.on(evt, cb),
    off: (evt, cb) => _lenisRef.value?.off(evt, cb),
    start: () => _lenisRef.value?.start(),
    stop: () => _lenisRef.value?.stop(),
    scrollTo: (...args) => _lenisRef.value?.scrollTo?.(...args),
  }
}

// ⬅️ Globale Zugriffsfunktion (z. B. für App.vue außerhalb von setup())
export function getLenis() {
  return _lenisRef.value
}

// ⬅️ Neuer Export: Lenis komplett zerstören
export function destroyLenis() {
  if (_rafId) cancelAnimationFrame(_rafId)
  _rafId = 0

  if (_lenisRef.value) {
    try {
      _lenisRef.value.destroy()
    } catch (e) {
      console.warn('[Lenis] destroy failed:', e)
    }
    _lenisRef.value = null
  }
}
