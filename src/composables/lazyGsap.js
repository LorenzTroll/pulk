// /src/composables/lazyGsap.js

let gsapInstance = null
let pluginsRegistered = false

export async function getGsap() {
  if (gsapInstance) return gsapInstance

  console.log('[lazyGsap] Loading GSAP…')

  const module = await import('gsap')
  gsapInstance = module.default || module

  console.log('[lazyGsap] GSAP loaded:', !!gsapInstance)

  return gsapInstance
}

export async function getGsapWithPlugins() {
  const gsap = await getGsap()

  if (pluginsRegistered) {
    console.log('[lazyGsap] Plugins already registered')
    return gsap
  }

  console.log('[lazyGsap] Loading GSAP plugins…')

  const [
    ScrollTriggerMod,
    SplitTextMod,
    DraggableMod,
    ScrollToPluginMod
  ] = await Promise.all([
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('gsap/Draggable'),
    import('gsap/ScrollToPlugin')
  ])

  // ESM-freundlich: mal kommt's als default, mal als Named Export
  const ScrollTrigger  = ScrollTriggerMod.ScrollTrigger  || ScrollTriggerMod.default  || ScrollTriggerMod
  const SplitText      = SplitTextMod.SplitText          || SplitTextMod.default      || SplitTextMod
  const Draggable      = DraggableMod.Draggable          || DraggableMod.default      || DraggableMod
  const ScrollToPlugin = ScrollToPluginMod.ScrollToPlugin || ScrollToPluginMod.default || ScrollToPluginMod

  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, ScrollToPlugin)

  // 👉 damit du sie später einfach über gsap.* bekommst:
  gsap.ScrollTrigger  = ScrollTrigger
  gsap.SplitText      = SplitText
  gsap.Draggable      = Draggable
  gsap.ScrollToPlugin = ScrollToPlugin

  pluginsRegistered = true

  console.log('[lazyGsap] Plugins registered ✔')

  return gsap
}
