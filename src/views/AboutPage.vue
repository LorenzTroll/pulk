<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'
import { getGsapWithPlugins } from '@/composables/lazyGsap'
import { attachScrollDepthTracker } from '@/utils/tracking'
import {
  Renderer, Camera, Transform,
  Plane as OGLPlane, Mesh, Program, Texture, Vec2
} from 'ogl'
import InlineLink from '@/components/InlineLink.vue'


/* -----------------------------------------------------------------------------
 * SEO / Meta
 * ---------------------------------------------------------------------------*/
useHead({
  title: 'Der Raum PULK – Creative Space mieten in Halle-Kröllwitz',
  meta: [
    {
      name: 'description',
      content:
        'Stuck, Dielen, modulares Holzdesign. Das ist der Creative Space Pulk in Halle-Kröllwitz. Fotos, Einblicke und die Geschichte hinter dem Workshopraum in der Talstraße 7.'
    },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },

    // Open Graph
    { property: 'og:title', content: 'PULK – Creative Space in Halle-Kröllwitz' },
    {
      property: 'og:description',
      content:
        'Nichts in diesem Raum ist Zufall. Materialien, Möbel und Raumaufteilung sind so gestaltet, dass sich unser Creative Space in Halle-Kröllwitz eurem Workshop-Format anpasst.'
    },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Creative Space in Halle-Kröllwitz' },
    { property: 'og:url', content: 'https://pulk.space/about/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'PULK – Creative Space in Halle-Kröllwitz' },
    {
      name: 'twitter:description',
      content:
        'Stuck, Dielen, modulares Holzdesign. Das ist der Creative Space Pulk in Halle-Kröllwitz. Fotos, Einblicke und die Geschichte hinter dem Workshopraum in der Talstraße 7.'
    },
    { name: 'twitter:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' }
  ],
  link: [{ rel: 'canonical', href: 'https://pulk.space/about/' }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'Über den Raum · PULK Halle (Saale)',
        description:
          'Entstehungsgeschichte und Designphilosophie des PULK Raums – ein wandelbarer Ort für Austausch und Zusammenarbeit in Halle (Saale).',
        url: 'https://pulk.space/about/',
        datePublished: '2026-04-23',
        dateModified: '2026-04-23',
        mainEntity: {
          '@type': 'Place',
          name: 'PULK Raum Halle',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Halle (Saale)',
            addressCountry: 'DE'
          }
        }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://pulk.space/' },
          { '@type': 'ListItem', position: 2, name: 'Über den Raum', item: 'https://pulk.space/about/' }
        ]
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': 'https://pulk.space/about#lorenz-troll',
        name: 'Lorenz Troll',
        jobTitle: 'Kommunikationsdesigner, Producer Interactive Media, AI Product Designer',
        description:
          'Designer und Marketing-Spezialist mit Blick für Storytelling, visuelle Systeme und digitale Formate. Hat zusammen mit Michel Klehm das Pulk in Halle (Saale) gegründet. Im Creative Space Pulk kümmert er sich um die Social-Media-Kanäle, Webseite und die Kommunikation mit den Gästen.',
        image: 'https://pulk.space/team/lorenz-troll.png',
        worksFor: { '@id': 'https://pulk.space/#pulk' },
        knowsAbout: [
          'Storytelling',
          'Content-Strategie',
          'Content-Creation',
          'Marketing',
          'Webdesign',
          'UX/UI-Design',
          'Grafikdesign',
          'Motion Design',
          'AI Creative Technology'
        ],
        sameAs: [
          'https://www.instagram.com/lorenztroll/',
          'https://www.linkedin.com/in/lorenz-troll-5a39291b2/'
        ]
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': 'https://pulk.space/about#michel-klehm',
        name: 'Michel Klehm',
        jobTitle: 'Fotograf',
        description:
          'Fotograf mit Fokus auf Porträt-, Architektur- und Reportagefotografie. Ein Spezialgebiet ist Kunstreproduktionsfotografie. Zusammen mit Lorenz Troll Mitgründer des Workshopraums Pulk in Halle (Saale).',
        worksFor: { '@id': 'https://pulk.space/#pulk' },
        knowsAbout: [
          'Porträtfotografie',
          'Architekturfotografie',
          'Analoge Fotografie',
          'Kunstreproduktionsfotografie'
        ],
        sameAs: [
          'https://www.instagram.com/michelklehm/',
          'https://michelklehm.de/'
        ]
      })
    }
  ]
})

/* -----------------------------------------------------------------------------
 * Refs & State
 * ---------------------------------------------------------------------------*/
const rootRef          = ref(null)
const canvasRef        = ref(null)
const footerSentinelRef = ref(null)
const btnLift          = ref(0)

function updateLift() {
  const sentinel = footerSentinelRef.value
  if (!sentinel) return
  const rect = sentinel.getBoundingClientRect()
  const vh   = window.innerHeight
  btnLift.value = Math.max(0, vh - rect.top)
}

let stTriggers        = []
let gsapInstance      = null
let scrollDepthCleanup = null
let SplitTextInstance = null

async function ensureGsap() {
  if (gsapInstance) return gsapInstance
  const gsap = await getGsapWithPlugins()
  gsapInstance = gsap
  SplitTextInstance = gsap.SplitText
  return gsap
}

/* -----------------------------------------------------------------------------
 * Images
 * ---------------------------------------------------------------------------*/
import gridImgA from '@/assets/pulk_about_imageA.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgB from '@/assets/pulk_about_imageB.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgC from '@/assets/pulk_about_imageC.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgD from '@/assets/pulk_about_imageD.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgE from '@/assets/pulk_about_imageE.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgF from '@/assets/pulk_about_imageF.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgG from '@/assets/pulk_about_imageG.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgH from '@/assets/pulk_about_imageH.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgI from '@/assets/pulk_about_imageI.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import gridImgJ from '@/assets/PULK_250513_Foto_Michel_Klehm_16.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

/* ═══════════════════════════════════════════════════════════════════════════
   WebGL Gallery — infinite auto-scroll with sine-wave warp
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── GLSL Shaders ──────────────────────────────── */
const GL_VERT = /* glsl */`
  #define PI 3.14159265358979323846
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uStrength;
  uniform vec2  uViewportSizes;
  varying vec2  vUv;
  void main() {
    vUv = uv;
    vec4 newPos = modelViewMatrix * vec4(position, 1.0);
    newPos.z += sin(newPos.y / uViewportSizes.y * PI + PI / 2.0) * -uStrength;
    gl_Position = projectionMatrix * newPos;
  }
`

const GL_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2  uImageSizes;
  uniform vec2  uPlaneSizes;
  uniform float uRadius;
  uniform float uAlpha;
  varying vec2  vUv;

  float roundedBox(vec2 uv, vec2 size, float r) {
    vec2 q = abs(uv * size - size * 0.5) - size * 0.5 + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec4 color = texture2D(tMap, uv);
    float d     = roundedBox(vUv, uPlaneSizes, uRadius);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, d);
    // Mobile-fix: maskierte Fragments verwerfen, sonst leaken auf TBR-GPUs (iOS) RGB-Werte durch
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(color.rgb, color.a * alpha * uAlpha);
  }
`

/* ─────────────────────────── Constants ─────────────────────────────────── */
const GL_WARP   = 0.9
const GL_RADIUS = 20.0

/* ─────────────────────────── GL State ──────────────────────────────────── */
let glRenderer = null
let glCamera   = null
let glScene    = null
let glRafId    = null
let glResObs   = null
let glMedias   = []

let glStrength    = 0
let glLastScrollY = 0
let glVW = 0, glVH = 0

function glLerp(a, b, t) { return a + (b - a) * t }

/* ─────────────────────────── Media Factory ─────────────────────────────── */
function glMakeMedia(src, domEl, x, y, w, h) {
  const gl = glRenderer.gl

  const geo     = new OGLPlane(gl, { widthSegments: 20, heightSegments: 20 })
  const tex     = new Texture(gl, { generateMipmaps: false })
  const program = new Program(gl, {
    vertex: GL_VERT,
    fragment: GL_FRAG,
    uniforms: {
      tMap:           { value: tex },
      uStrength:      { value: 0 },
      uAlpha:         { value: 0 },
      uViewportSizes: { value: new Vec2(glVW, glVH) },
      uImageSizes:    { value: new Vec2(1, 1) },
      uPlaneSizes:    { value: new Vec2(w, h) },
      uRadius:        { value: GL_RADIUS }
    }
  })

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    tex.image = img
    program.uniforms.uImageSizes.value = new Vec2(img.naturalWidth, img.naturalHeight)
  }
  img.src = src

  const mesh = new Mesh(gl, { geometry: geo, program })
  mesh.scale.x    = w
  mesh.scale.y    = h
  mesh.position.x = x
  mesh.position.y = y
  glScene.addChild(mesh)

  return { mesh, program, domEl }
}

/* ─────────────────────────── Build Scene ───────────────────────────────── */
function glBuildScene() {
  glMedias.forEach(m => glScene.removeChild(m.mesh))
  glMedias = []

  glVW = glRenderer.width
  glVH = glRenderer.height

  const items = [...(rootRef.value?.querySelectorAll('.gl-item') ?? [])]

  items.forEach((el) => {
    const src = el.getAttribute('data-gl-src')
    if (!src) return
    const r = el.getBoundingClientRect()
    const w = r.width
    const h = r.height
    if (!w || !h) return
    const x =  r.left + w / 2 - glVW / 2
    const y = -(r.top  + h / 2 - glVH / 2)
    glMedias.push(glMakeMedia(src, el, x, y, w, h))
  })
}

/* ─────────────────────────── RAF Loop ──────────────────────────────────── */
function glTick() {
  glRafId = requestAnimationFrame(glTick)

  glStrength = glLerp(glStrength, 0, 0.04)

  glMedias.forEach(m => {
    const r = m.domEl.getBoundingClientRect()
    m.mesh.position.x = r.left + r.width  / 2 - glVW / 2
    m.mesh.position.y = -(r.top  + r.height / 2 - glVH / 2)
    m.mesh.scale.x = r.width
    m.mesh.scale.y = r.height
    m.program.uniforms.uPlaneSizes.value    = new Vec2(r.width, r.height)
    m.program.uniforms.uStrength.value      = glStrength
    m.program.uniforms.uViewportSizes.value = new Vec2(glVW, glVH)
  })

  glRenderer.render({ scene: glScene, camera: glCamera })
}

/* ─────────────────────────── Scroll → Warp ─────────────────────────────── */
function glOnScroll() {
  const scrollY = window.scrollY
  const vel     = scrollY - glLastScrollY
  glStrength    = glLerp(glStrength, vel * GL_WARP, 0.4)
  glLastScrollY = scrollY
}

/* ─────────────────────────── Resize ────────────────────────────────────── */
function glOnResize() {
  if (!glRenderer) return
  const w = window.innerWidth, h = window.innerHeight
  glRenderer.setSize(w, h)
  glVW = w; glVH = h
  const camZ = (h / 2) / Math.tan((Math.PI / 180) * (glCamera.fov / 2))
  glCamera.perspective({ aspect: w / h })
  glCamera.position.z = camZ
  glBuildScene()
  // Nach dem Rebuild: Alpha auf 1 setzen, da das initiale Reveal bereits gelaufen ist
  glMedias.forEach(m => { m.program.uniforms.uAlpha.value = 1 })
}

/* ─────────────────────────── Init / Destroy ────────────────────────────── */
function glInit() {
  const canvas = canvasRef.value
  if (!canvas) return

  const w = window.innerWidth, h = window.innerHeight

  glRenderer = new Renderer({
    canvas, width: w, height: h,
    alpha: true, antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2)
  })
  const gl = glRenderer.gl
  gl.clearColor(0, 0, 0, 0)

  const FOV  = 45
  const camZ = (h / 2) / Math.tan((Math.PI / 180) * (FOV / 2))
  glCamera = new Camera(gl, { fov: FOV, near: 0.1, far: camZ * 2 })
  glCamera.perspective({ aspect: w / h })
  glCamera.position.z = camZ

  glScene       = new Transform()
  glStrength    = 0
  glLastScrollY = window.scrollY

  glBuildScene()
  glTick()

  window.addEventListener('scroll', glOnScroll, { passive: true })
  glResObs = new ResizeObserver(glOnResize)
  glResObs.observe(document.documentElement)
}

function glDestroy() {
  if (glRafId) {
    cancelAnimationFrame(glRafId)
    glRafId = null
  }
  glResObs?.disconnect()
  glResObs = null
  window.removeEventListener('scroll', glOnScroll)
  if (glScene) glMedias.forEach(m => glScene.removeChild(m.mesh))
  glMedias = []
  glRenderer = null
}

/* ═══════════════════════════════════════════════════════════════════════════
   GSAP Reveal — ScrollTrigger reveals with SplitText
   ═══════════════════════════════════════════════════════════════════════════ */
function setupReveals(gsap, container) {
  const ScrollTrigger = gsap.ScrollTrigger
  const SplitText     = SplitTextInstance

  const els = [...container.querySelectorAll('.reveal-up')]
  if (!els.length) return

  els.forEach(el => {
    const delay    = parseFloat(el.getAttribute('data-reveal-delay')    ?? 0)
    const duration = parseFloat(el.getAttribute('data-reveal-duration') ?? 0.7)
    const ease     =               el.getAttribute('data-reveal-ease')  ?? 'power2.out'
    const offset   = parseFloat(el.getAttribute('data-reveal-offset')   ?? 28)
    const start    =               el.getAttribute('data-reveal-start') ?? 'top bottom'

    el.style.visibility = 'hidden'

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        el.style.visibility = ''

        if (SplitText && el.classList.contains('animated-text')) {
          const split = new SplitText(el, { type: 'words', wordsClass: 'word' })
          gsap.set(split.words, { color: 'rgba(255,255,255,0.12)' })
          gsap.to(split.words, {
            color: '#ffffff',
            duration: duration || 1.2,
            stagger: 0.035,
            ease,
            delay,
            onComplete: () => split.revert()
          })
        } else {
          const baseY = Number(gsap.getProperty(el, 'y')) || 0
          gsap.fromTo(
            el,
            { y: baseY + offset, opacity: 0 },
            { y: baseY, opacity: 1, duration, delay, ease, clearProps: 'willChange' }
          )
        }
      }
    })

    stTriggers.push(st)
  })

  ScrollTrigger.refresh()
}

/* ─────────────────────────── Lifecycle ─────────────────────────────────── */
onMounted(async () => {
  await nextTick()
  const container = rootRef.value
  if (!container) return

  glInit()
  setTimeout(() => {
    if (glRenderer) {
      glStrength = 0
      glLastScrollY = window.scrollY
      glBuildScene()
      if (canvasRef.value && gsapInstance) {
        gsapInstance.fromTo(
          canvasRef.value,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', clearProps: 'y' }
        )
      } else if (canvasRef.value) {
        canvasRef.value.style.opacity = '1'
      }

      // Reveal each WebGL plane sequentially on load
      if (gsapInstance) {
        glMedias.forEach((media, i) => {
          gsapInstance.to(media.program.uniforms.uAlpha, {
            value: 1,
            duration: 0.7,
            delay: 0.1 + i * 0.1,
            ease: 'power2.out'
          })
        })
      }
    }
  }, 520)

  window.addEventListener('scroll', updateLift, { passive: true })
  scrollDepthCleanup = attachScrollDepthTracker('about')

  const gsap = await ensureGsap()
  const SplitText = SplitTextInstance

  // Animate reveal-up elements: in-viewport cascade on mount, below-fold via ScrollTrigger
  const revealEls = [...container.querySelectorAll('.reveal-up')]
  const vh = window.innerHeight || document.documentElement.clientHeight
  const ScrollTrigger = gsap.ScrollTrigger

  const animateEl = (el, cascadeDelay) => {
    const delay    = parseFloat(el.getAttribute('data-reveal-delay')    ?? 0)
    const duration = parseFloat(el.getAttribute('data-reveal-duration') ?? 0.7)
    const ease     =               el.getAttribute('data-reveal-ease')  ?? 'power2.out'
    const offset   = parseFloat(el.getAttribute('data-reveal-offset')   ?? 28)

    el.style.visibility = ''

    if (SplitText && el.classList.contains('animated-text')) {
      const split = new SplitText(el, { type: 'words', wordsClass: 'word' })
      gsap.set(split.words, { color: 'rgba(255,255,255,0.12)' })
      gsap.to(split.words, {
        color: '#ffffff',
        duration: duration || 1.2,
        stagger: 0.035,
        ease,
        delay: cascadeDelay + delay,
        onComplete: () => {
          el.style.color = '#ffffff'
          split.revert()
        }
      })
    } else {
      const baseY = Number(gsap.getProperty(el, 'y')) || 0
      gsap.fromTo(
        el,
        { y: baseY + offset, opacity: 0 },
        { y: baseY, opacity: 1, duration, delay: cascadeDelay + delay, ease, clearProps: 'willChange' }
      )
    }
  }

  let inViewIndex = 0
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.top < vh) {
      animateEl(el, 0.15 + inViewIndex * 0.06)
      inViewIndex++
    } else {
      el.style.visibility = 'hidden'
      const start = el.getAttribute('data-reveal-start') ?? 'top bottom'
      if (ScrollTrigger) {
        const st = ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          invalidateOnRefresh: true,
          onEnter: () => animateEl(el, 0)
        })
        stTriggers.push(st)
      }
    }
  })
  if (ScrollTrigger) ScrollTrigger.refresh()

  glStrength = 0
  glLastScrollY = window.scrollY
})

onBeforeUnmount(() => {
  stTriggers.forEach(t => t.kill())
  stTriggers = []
  glDestroy()
  window.removeEventListener('scroll', updateLift)
  scrollDepthCleanup?.()
})
</script>

<template>
  <main ref="rootRef" class="about-wrap">

    <!-- Full-page WebGL canvas — position:fixed, covers viewport -->
    <canvas ref="canvasRef" class="gl-canvas" />

    <!-- All content sits above the canvas -->
    <div class="modal-content">

      <!-- Header: Headline + Description -->
      <header class="about-header">
        <h1 class="about-headline reveal-up" data-reveal-delay="0.2">Creative Space<br /> in Halle Saale mieten</h1>
        <div class="about-intro">
          <p class="about-description reveal-up animated-text" data-reveal-delay="0.35">
            Talstraße 7 in Halle-Kröllwitz. Blick auf die Saale und Burg Giebichenstein, vier Meter Decke,
            Stuck und Dielen. Darin: Formen aus geweißter Kiefer und Aluminium. Ein Podest, halbtransparente Vorhänge, die den Raum teilen und öffnen.
            Nichts davon ist Dekoration, alles hat eine Funktion. Das Podest wird Bühne, Rückzugsort oder Arbeitsplatz.
            100 Quadratmeter, modulare Tische und Stühle, Teeküche. Beamer, Fernseher, Whiteboard, Moderationsmaterial. Stundenweise mietbar,
            bis 40 Personen, sieben Tage die Woche. Ein Kreativraum und Workshopraum zur Miete in Halle (Saale).
          </p>
        </div>
      </header>

      <!-- Photo Grid — figures are visibility:hidden; WebGL planes mirror them -->
      <section class="photo-grid">
        <figure class="gl-item img-a reveal-up" :data-gl-src="gridImgA.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgA.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgA.img.src" :srcset="gridImgA.img.srcset" alt="Heller Innenraum des Pulk in Halle mit drei großen Fenstern und halbtransparenten Vorhängen" loading="eager" fetchpriority="high" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-b reveal-up" :data-gl-src="gridImgB.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgB.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgB.img.src" :srcset="gridImgB.img.srcset" alt="Blick durch die Schiebetür vom Podest in den Hauptbereich des Pulk mit aufgebauten Stuhlreihen" loading="eager" fetchpriority="high" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-c reveal-up" :data-gl-src="gridImgC.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgC.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgC.img.src" :srcset="gridImgC.img.srcset" alt="Geöffnete Teeküche im Pulk mit Kaffeemaschine, Spülbecken und Geschirr für Workshops" loading="eager" fetchpriority="high" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-j reveal-up" :data-gl-src="gridImgJ.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgJ.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgJ.img.src" :srcset="gridImgJ.img.srcset" alt="Treppe hinauf zum Podest im Pulk mit Kisten und halb zugezogenem Vorhang" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-d reveal-up" :data-gl-src="gridImgD.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgD.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgD.img.src" :srcset="gridImgD.img.srcset" alt="Weitwinkelansicht des Pulk Richtung Eingangstür mit einzelnen Tischen und Sitzgelegenheiten" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-e reveal-up" :data-gl-src="gridImgE.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgE.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgE.img.src" :srcset="gridImgE.img.srcset" alt="Podestbereich im Pulk mit Tischen und Sitzgelegenheiten, abgetrennt vom Hauptraum" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-f reveal-up" :data-gl-src="gridImgF.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgF.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgF.img.src" :srcset="gridImgF.img.srcset" alt="Eingangsperspektive im Pulk mit drei einzelnen Tischen, eine Person läuft durchs Bild" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-g reveal-up" :data-gl-src="gridImgG.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgG.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgG.img.src" :srcset="gridImgG.img.srcset" alt="Aufgestellte Stuhlreihen im Pulk mit Blick auf das Rednerpult für Seminare und Vorträge" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <figure class="gl-item img-h reveal-up" :data-gl-src="gridImgH.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgH.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgH.img.src" :srcset="gridImgH.img.srcset" alt="Offenes Podest im Pulk ohne Raumtrennung mit einer Reihe Tische, Lampen und Sitzgelegenheiten" loading="lazy" decoding="async" />
          </picture>
        </figure>
      </section>

      <!-- Bottom Section: Foto links · Text-Card rechts -->
      <section class="about-bottom">
        <figure class="gl-item img-i reveal-up" :data-gl-src="gridImgI.img.src">
          <picture>
            <source v-for="(srcset, format) in gridImgI.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
            <img :src="gridImgI.img.src" :srcset="gridImgI.img.srcset" alt="Lorenz und Michel, die Gründer des Pulk, gemeinsam an einem Tisch im Workshopraum" loading="lazy" decoding="async" />
          </picture>
        </figure>
        <div class="text-card-inner">
          <span class="dot dot-tl"></span>
          <span class="dot dot-tr"></span>
          <div class="text-card-content">
            <h2 class="text-card-headline reveal-up">Von der Idee<wbr> zum Raum</h2>
            <p class="text-card-body reveal-up animated-text">
              Wir sind Lorenz und Michel. Wir betreiben das Pulk und haben den Ort so gestaltet, wie wir uns einen Raum wünschen würden.
              Ein Jahr Planung, sägen, Ideen sammeln, fräsen, nähen damit in der Talstraße 7 ein Kreativraum entsteht, der bitte nicht pragmatisch
              und nüchtern ist. Pulk ist ein Ort, an dem Produktivität und Gemütlichkeit sich nicht ausschließen. Ein Raum, der euch in die Lage versetzt,
              euch auf das Wesentliche zu konzentrieren. Das möchten wir mit euch teilen. Pulk ist gemacht, um sich anzupassen: an Gruppen, an Formate,
              an Ideen. Ein Stück Handwerk. Ein Stück Design. Stundenweise zur Miete, damit eure Projekte den passenden Raum finden.
              Alle Pakete und Tarife findet ihr auf unserer Seite <InlineLink to="/preise">Preise & Pakete</InlineLink>.
            </p>
          </div>
          <span class="dot dot-bl"></span>
          <span class="dot dot-br"></span>
        </div>
      </section>

      <!-- Footer sentinel — lets close button lift above the footer -->
      <div ref="footerSentinelRef" class="about-footer-sentinel"></div>

    </div><!-- /.modal-content -->

    <!-- Fixed close button -->
    <router-link
      to="/"
      class="about-close-btn"
      :style="{ '--ap-btn-lift': `${btnLift}px` }"
    >
      <span>Schließen</span>
      <span class="about-close-icon">✕</span>
    </router-link>

  </main>
</template>

<style scoped>
/* ---- Base ---- */
.about-wrap {
  position: relative;
  width: 100%;
  color: #fff;
  background: #141414;
  padding-bottom: 6rem;
  min-height: 100dvh;
}

/* ---- Close button ---- */
.about-close-btn {
  position: fixed;
  left: 50%;
  bottom: calc(2rem + env(safe-area-inset-bottom, 0px) + var(--ap-btn-lift, 0px));
  transform: translateX(-50%);
  z-index: 5000;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  background: #000;
  color: #fff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 500;
  font-size: 1.125rem;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 0.2s ease;
}

.about-close-btn:hover {
  transform: translateX(-50%) scale(1.05);
}

.about-close-icon {
  font-size: 1rem;
}

.about-footer-sentinel {
  height: 0;
}

/* ---- Header ---- */
.about-header {
  display: flex;
  gap: 4rem;
  padding: 12rem 7.5% 6rem;
  align-items: flex-start;
}

.about-headline {
  flex: 0 0 30%;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.114;
  color: #fff;
  margin: 0;
}

.about-intro {
  flex: 1;
  padding-top: 0.5rem;
}

.about-description {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #fff;
  margin: 0;
}

.animated-text .word {
  display: inline-block;
  white-space: normal;
  will-change: color;
}

/* ════════════════════════════════════════════════════════
   WebGL — fixed canvas + gl-item layer
   ════════════════════════════════════════════════════════ */
.gl-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  display: block;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  /* Safari 26 Toolbar-Sampling: explicit transparent damit Safari diesen
     fixed Canvas nicht für Color-Tinting heranzieht (sonst werden die
     gerenderten Photo-Pixel als Toolbar-Tönung interpretiert). */
  background-color: transparent;
}

/* All content floats above the canvas */
.modal-content {
  position: relative;
  z-index: 2;
}

/* GL items are invisible in the DOM — WebGL planes mirror their positions */
.gl-item {
  visibility: hidden;
  pointer-events: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: 1.25rem;
}

/* ================================================================
   PHOTO GRID — Mobile first
   ================================================================ */
.photo-grid {
  padding: 6rem 4% 0rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.img-a, .img-b, .img-c,
.img-d, .img-e, .img-f,
.img-g, .img-h { aspect-ratio: 4 / 3; }

.img-j { display: none; }

/* ---- Tablet ---- */
@media (min-width: 641px) and (max-width: 1024px) {
  .photo-grid {
    padding: 0 5%;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 2rem;
    column-gap: 2rem;
  }

  .img-a, .img-b, .img-c, .img-j,
  .img-e, .img-f, .img-g, .img-h { aspect-ratio: 4 / 3; }

  .img-j { display: block; }

  .img-d { grid-column: 1 / span 2; aspect-ratio: 16 / 9; }
}

/* ---- Desktop ---- */
@media (min-width: 1025px) {
  .photo-grid {
    padding: 12rem 7.5% 1rem;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(9, 6.5rem);
    column-gap: 4rem;
    row-gap: 4rem;
  }

  .img-j { display: none; }

  .img-a, .img-b, .img-c,
  .img-d, .img-e, .img-f,
  .img-g, .img-h { aspect-ratio: auto; }

  .img-a { grid-column: 1 / 4;  grid-row: 1 / 4; }
  .img-b { grid-column: 4 / 7;  grid-row: 1 / 4; }
  .img-c { grid-column: 7 / 11; grid-row: 1 / 5; }

  .img-d { grid-column: 1 / 7;  grid-row: 4 / 7; }
  .img-e { grid-column: 7 / 11; grid-row: 5 / 7; }

  .img-f { grid-column: 1 / 5;  grid-row: 7 / 10; }
  .img-g { grid-column: 5 / 8;  grid-row: 7 / 10; }
  .img-h { grid-column: 8 / 11; grid-row: 7 / 10; }
}

/* ---- Bottom Section ---- */
.about-bottom {
  display: flex;
  gap: 4rem;
  padding: 1.25rem 7.5% 0;
  align-items: flex-start;
  margin-bottom: 8rem;
}

.img-i {
  flex: 0 0 43%;
  align-self: stretch;
  margin-top: 2rem;
  height: 35rem;
}

/* ---- Text Card ---- */
.text-card-inner {
  flex: 1;
  align-self: stretch;
  margin-bottom: 2rem;
  min-height: 28rem;
  display: grid;
  grid-template-columns: 0.9375rem 1fr 0.9375rem;
  grid-template-rows: auto 1fr auto;
  column-gap: 2rem;
  row-gap: 2rem;
  align-items: start;
}

.dot {
  display: block;
  width: 0.9375rem;
  height: 0.9375rem;
  border-radius: 0.1875rem;
  background-color: #fc0;
  align-self: start;
}

.dot-tl { grid-column: 1; grid-row: 1; }
.dot-tr { grid-column: 3; grid-row: 1; }
.dot-bl { grid-column: 1; grid-row: 3; }
.dot-br { grid-column: 3; grid-row: 3; }

.text-card-content {
  grid-column: 2;
  grid-row: 1 / span 3;
  align-self: center;
}

.text-card-headline {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.114;
  color: #fff;
  margin: 0 0 1.5rem;
}

.text-card-body {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #fff;
  margin: 0;
}

/* ---- Tablet ---- */
@media (min-width: 641px) and (max-width: 1024px) {
  .about-header {
    padding: 8rem 10% 8rem;
    flex-direction: column;
    gap: 2rem;
  }

  .about-headline { flex: none; }

  .about-bottom {
    padding: 0rem 5% 0;
    flex-direction: column;
  }

  .img-i { flex: none; width: 100%; aspect-ratio: 16 / 9; }

  .about-description,
  .text-card-body {
    font-size: clamp(1.5rem, 1.4vw, 1.6rem);
  }
}

/* ---- Mobile ---- */
@media (max-width: 640px) {
  /* Bottom-Padding auf reines Safe-Area-Inset reduzieren — der bisherige
     4rem-Wert war ein Rest aus früheren Safe-Area-Workarounds und hat
     zusammen mit dem Default min-height:100dvh dafür gesorgt, dass
     .about-wrap bis in die untere Safe-Area extendet und dort als solid
     #141414-Block durchscheint. Dadurch tönte die iOS-Safari Liquid-Glass-
     Toolbar konstant statisch dunkel. Analog zum Fix in AboutModal. */
  .about-wrap { padding-bottom: env(safe-area-inset-bottom, 0rem); }

  /* WebGL-Canvas auf Mobile deaktivieren — analog zu AboutModal Mobile.
     Der fixed full-viewport Canvas (position:fixed; top:0; height:100dvh)
     wurde von Safari 26 als Sampling-Quelle für Toolbar-Color-Tinting
     herangezogen und produzierte eine schwarze Farbfläche am unteren
     Bildrand. Stattdessen die echten <picture>/<img>-Elemente sichtbar
     machen — sie sind im DOM bereits vorhanden, nur per visibility:hidden
     ausgeblendet. */
  .gl-canvas { display: none; }
  .gl-item { visibility: visible; }
  .gl-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .about-close-btn {
    padding: 1rem 1rem;
    font-size: 0.95rem;
    gap: 0.5rem;
    bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px) + var(--ap-btn-lift, 0px));
  }

  .about-header {
    padding: 6rem 7.5% 0rem;
    flex-direction: column;
    gap: 1.5rem;
  }

  .about-headline,
  .text-card-headline {
    flex: none;
    font-size: clamp(2.5rem, 6vw, 3rem);
  }

  .about-bottom {
    padding: 0rem 4% 0;
    flex-direction: column;
    gap: 1rem;
    margin-top: -1rem;
    margin-bottom: 15rem;
  }

  .img-a { aspect-ratio: 4 / 3; }
  .img-b { aspect-ratio: 3 / 4; }
  .img-c { aspect-ratio: 1 / 1; }
  .img-d { aspect-ratio: 16 / 9; }
  .img-e { aspect-ratio: 3 / 4; }
  .img-f { aspect-ratio: 4 / 3; }
  .img-g { aspect-ratio: 1 / 1; }
  .img-h { aspect-ratio: 3 / 4; }

  .img-i { flex: none; width: 100%; aspect-ratio: 4 / 3; }

  .text-card-inner {
    flex: 1 1 44rem;
    column-gap: 1rem;
    row-gap: 3rem;
    padding: 0rem 0;
    grid-template-rows: auto auto;
  }

  .text-card-content {
    grid-row: 2;
  }

}

/* ---- Desktop ---- */
@media (min-width: 1025px) {
  .about-intro {
    max-width: 55%;
    margin-left: auto;
    margin-right: 0;
  }
}

:global(.about-wrap ~ .site-footer) {
  margin-top: -3rem;
}
</style>
