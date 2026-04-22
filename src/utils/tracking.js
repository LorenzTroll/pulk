/**
 * Sitesight / MDAL Tracking Helper
 *
 * Taxonomie: pulk.<bereich>.<action>
 *   Beispiele: pulk.nav.click, pulk.contact.submit, pulk.pricing.adjust
 *
 * Verwendung:
 *   import { track, trackDebounced } from '@/utils/tracking'
 *   track('pulk.nav.click', { target: 'contact', source: 'bottommenu' })
 *   trackDebounced('pulk.pricing.adjust', { package: 'business', persons: 8 })
 */

function sendEvent(name, params) {
  if (typeof window === 'undefined') return
  if (!window.MDAL || typeof window.MDAL.event !== 'function') return

  const parameters = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([Name, Value]) => ({ Name, Value }))

  try {
    window.MDAL.event({ Name: name, Parameters: parameters })
  } catch (err) {
    console.warn('[Sitesight] track failed:', name, err)
  }
}

export function track(name, params = {}) {
  sendEvent(name, params)
}

const _debounceTimers = {}

export function trackDebounced(name, params = {}, delay = 1500) {
  if (_debounceTimers[name]) clearTimeout(_debounceTimers[name])
  _debounceTimers[name] = setTimeout(() => {
    sendEvent(name, params)
    delete _debounceTimers[name]
  }, delay)
}

/**
 * Feuert pulk.scroll.depth einmalig pro Schwelle (25/50/75/100 %).
 * Optional an einen Scroll-Container binden (z. B. einen Page-Root).
 * Rückgabewert ist eine Detach-Funktion für onBeforeUnmount.
 */
export function attachScrollDepthTracker(page, container = null) {
  if (typeof window === 'undefined') return () => {}

  const hit = { 25: false, 50: false, 75: false, 100: false }

  const onScroll = () => {
    let y, height
    if (container) {
      y = container.scrollTop
      height = container.scrollHeight - container.clientHeight
    } else {
      const doc = document.documentElement
      y = window.scrollY || doc.scrollTop || 0
      height = Math.max(doc.scrollHeight, document.body?.scrollHeight || 0) - window.innerHeight
    }
    if (height <= 0) return

    const percent = (y / height) * 100

    ;[25, 50, 75, 98].forEach(threshold => {
      const bucket = threshold === 98 ? 100 : threshold
      if (!hit[bucket] && percent >= threshold) {
        hit[bucket] = true
        sendEvent('pulk.scroll.depth', { percent: bucket, page })
      }
    })
  }

  const target = container || window
  target.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  return () => target.removeEventListener('scroll', onScroll)
}
