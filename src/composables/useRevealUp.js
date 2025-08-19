// src/composables/useRevealUp.js
import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function useRevealUp(selector = '.reveal-up', defaults = {}) {
  const triggers = []

  const getEl = (v) => (v && v.value) ? v.value : v

  function init(rootMaybe) {
    const root     = getEl(rootMaybe) || getEl(defaults.container) || document
    const scroller = getEl(defaults.scroller)
    const els      = Array.from(root.querySelectorAll(selector))
    if (!els.length) return

    els.forEach((el) => {
      const delay    = parseFloat(el.getAttribute('data-reveal-delay')    || defaults.delay    || 0)
      const duration = parseFloat(el.getAttribute('data-reveal-duration') || defaults.duration || 0.6)
      const ease     =               el.getAttribute('data-reveal-ease')  || defaults.ease     || 'power2.out'
      const start    =               el.getAttribute('data-reveal-start') || defaults.start    || 'top 75%'

      const st = ScrollTrigger.create({
        trigger: el,
        start,
        scroller,
        once: defaults.once ?? true,
        invalidateOnRefresh: true,
        onEnter: () => {
          gsap.to(el, {
            y: 0,            // von CSS: translateY(24px) -> 0
            opacity: 1,      // von CSS: 0 -> 1
            duration,
            delay,
            ease,
            clearProps: 'willChange'
          })
        }
      })
      triggers.push(st)
    })

    // gleich messen, damit onEnter ggf. sofort auslöst
    ScrollTrigger.refresh()
  }

  function kill() {
    triggers.forEach(t => t.kill())
    triggers.length = 0
  }

  onMounted(() => {
    // auto-init nur, wenn NICHT lazy
    if (defaults.lazy !== true) init()
  })

  onBeforeUnmount(kill)

  // explizit nutzbar (z. B. beim Öffnen eines Modals)
  return { init, kill }
}
