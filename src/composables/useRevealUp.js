// /src/composables/useRevealUp.js
import { onMounted, onBeforeUnmount } from 'vue'
import { getGsapWithPlugins } from '@/composables/lazyGsap'

console.log('[useRevealUp] File loaded')

export function useRevealUp(selector = '.reveal-up', defaults = {}) {
  const triggers = []

  // Hilfsfunktion, um evtl. Refs zu entpacken
  const getEl = v => (v && v.value) ? v.value : v

  onMounted(async () => {
    console.log('[useRevealUp] onMounted triggered')

    const gsap = await getGsapWithPlugins()
    console.log('[useRevealUp] GSAP loaded?', !!gsap)

    if (!gsap) {
      console.warn('[useRevealUp] GSAP missing → abort')
      return
    }

    const ScrollTrigger = gsap.ScrollTrigger
    const SplitText = gsap.SplitText

    if (!ScrollTrigger) {
      console.warn('[useRevealUp] ScrollTrigger missing on gsap')
      return
    }

    console.log('[useRevealUp] ScrollTrigger OK, SplitText:', !!SplitText)

    const root     = getEl(defaults.container) || document
    const scroller = getEl(defaults.scroller) || null

    const els = Array.from(root.querySelectorAll(selector))
    console.log('[useRevealUp] Found elements:', els.length, els)

    if (!els.length) return

    els.forEach(el => {
      const delay    = parseFloat(el.getAttribute('data-reveal-delay')    ?? defaults.delay    ?? 0)
      const duration = parseFloat(el.getAttribute('data-reveal-duration') ?? defaults.duration ?? 0.6)
      const ease     =               el.getAttribute('data-reveal-ease')  ?? defaults.ease     ?? 'power2.out'
      const offset   = parseFloat(el.getAttribute('data-reveal-offset')   ?? defaults.offset   ?? 24)
      const start    =               el.getAttribute('data-reveal-start') ?? defaults.start    ?? 'top 80%'

      const triggerSelector = el.getAttribute('data-reveal-trigger')
      const triggerEl = triggerSelector ? root.querySelector(triggerSelector) : el

      el.style.visibility = 'hidden'

      const st = ScrollTrigger.create({
        trigger: triggerEl,
        start,
        scroller,
        once: defaults.once ?? true,
        invalidateOnRefresh: true,
        onEnter: () => {
          el.style.visibility = ''

          // ✨ SplitText-Variante
          if (SplitText && el.classList.contains('animated-text')) {
            console.log('[useRevealUp] Animating with SplitText', el)
            const split = new SplitText(el, { type: 'lines', linesClass: 'line' })

            gsap.set(split.lines, { color: '#00000034' })

            gsap.to(split.lines, {
              color: '#141414',
              duration: duration || 1.2,
              stagger: 0.25,
              ease,
              delay,
              onComplete: () => {
                // Text wieder normalisieren
                split.revert()
              }
            })
          }
          // Standard reveal-up
          else {
            console.log('[useRevealUp] Animating with simple reveal', el)
            const baseY = Number(gsap.getProperty(el, 'y')) || 0

            gsap.fromTo(
              el,
              { y: baseY + offset, opacity: 0 },
              {
                y: baseY,
                opacity: 1,
                duration,
                delay,
                ease,
                clearProps: 'willChange'
              }
            )
          }
        }
      })

      triggers.push(st)
    })

    ScrollTrigger.refresh()
  })

  onBeforeUnmount(() => {
    triggers.forEach(t => t.kill())
    triggers.length = 0
  })
}
