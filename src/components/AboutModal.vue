<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-white_E3.svg'
import { getGsapWithPlugins } from '@/composables/lazyGsap'
import {
  Renderer, Camera, Transform,
  Plane as OGLPlane, Mesh, Program, Texture, Vec2
} from 'ogl'

/* -----------------------------------------------------------------------------
 * Props & Emits
 * ---------------------------------------------------------------------------*/
const props = defineProps({
  visible: { type: Boolean, required: true },
  enterDelay: { type: Number, default: 0 },
  stagger: { type: Number, default: 0.2 }
})
const emit = defineEmits(['close'])

/* -----------------------------------------------------------------------------
 * Refs & State
 * ---------------------------------------------------------------------------*/
const rootRef      = ref(null)
const canvasRef    = ref(null)
const canvasWrapRef = ref(null)

let stTriggers       = []
let gsapInstance     = null
let SplitTextInstance = null

async function ensureGsap() {
  if (gsapInstance) return gsapInstance
  const gsap = await getGsapWithPlugins()
  gsapInstance = gsap
  SplitTextInstance = gsap.SplitText   // lazyGsap stores it directly on gsap
  return gsap
}

/* -----------------------------------------------------------------------------
 * Images (static assets)
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
   WebGL Gallery — Codrops-style infinite auto-scroll with sine-wave warp
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

  // Signed distance field for a rounded rectangle.
  // uv in [0,1], size in px, r = corner radius in px.
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

    // Clip to rounded corners via SDF (soft 2 px AA edge)
    float d     = roundedBox(vUv, uPlaneSizes, uRadius);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, d);
    // Mobile-fix: maskierte Fragments verwerfen, sonst leaken auf TBR-GPUs (iOS) RGB-Werte durch
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(color.rgb, color.a * alpha * uAlpha);
  }
`

/* ─────────────────────────── Constants ─────────────────────────────────── */
const GL_WARP   = 0.9   // scroll px/event → shader warp strength
const GL_RADIUS = 20.0  // corner radius in px (= 1.25rem at 16px base)

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
// Reads all .gl-item positions from the live DOM (viewport coords).
// Canvas is fake-fixed to the viewport, so we use viewport-relative coords.
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
    if (!w || !h) return  // skip display:none elements
    // Viewport-centre-relative 3D coords (Y axis flipped)
    const x =  r.left + w / 2 - glVW / 2
    const y = -(r.top  + h / 2 - glVH / 2)
    glMedias.push(glMakeMedia(src, el, x, y, w, h))
  })
}

/* ─────────────────────────── RAF Loop ──────────────────────────────────── */
function glTick() {
  glRafId = requestAnimationFrame(glTick)

  // Fake-fix the canvas: translate it down by scrollTop so it always
  // covers the visible viewport even though it is position:absolute.
  const scrollTop = rootRef.value?.scrollTop ?? 0
  if (canvasRef.value) canvasRef.value.style.transform = `translateY(${scrollTop}px)`

  // Ease warp strength back to flat
  glStrength = glLerp(glStrength, 0, 0.04)

  // Update every plane to its element's current viewport position + size
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
  const scrollY = rootRef.value?.scrollTop ?? 0
  const vel     = scrollY - glLastScrollY
  glStrength    = glLerp(glStrength, vel * GL_WARP, 0.4)
  glLastScrollY = scrollY
}

/* ─────────────────────────── Resize ────────────────────────────────────── */
function glOnResize() {
  if (!glRenderer || !rootRef.value) return
  const { width, height } = rootRef.value.getBoundingClientRect()
  if (!width || !height) return
  glRenderer.setSize(width, height)
  glVW = width; glVH = height
  const camZ = (height / 2) / Math.tan((Math.PI / 180) * (glCamera.fov / 2))
  glCamera.perspective({ aspect: width / height })
  glCamera.position.z = camZ
  glBuildScene()
  // Nach dem Rebuild: Alpha auf 1 setzen, da das initiale Reveal bereits gelaufen ist
  glMedias.forEach(m => { m.program.uniforms.uAlpha.value = 1 })
}

/* ─────────────────────────── Init / Destroy ────────────────────────────── */
function glInit() {
  const wrap   = rootRef.value
  const canvas = canvasRef.value
  if (!wrap || !canvas) return

  const { width, height } = wrap.getBoundingClientRect()
  if (!width || !height) return

  glRenderer = new Renderer({
    canvas, width, height,
    alpha: true, antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2)
  })
  const gl = glRenderer.gl
  gl.clearColor(0, 0, 0, 0) // transparent — background from .about-wrap

  const FOV  = 45
  const camZ = (height / 2) / Math.tan((Math.PI / 180) * (FOV / 2))
  glCamera = new Camera(gl, { fov: FOV, near: 0.1, far: camZ * 2 })
  glCamera.perspective({ aspect: width / height })
  glCamera.position.z = camZ

  glScene       = new Transform()
  glStrength    = 0
  glLastScrollY = wrap.scrollTop

  glBuildScene()
  glTick()

  wrap.addEventListener('scroll', glOnScroll, { passive: true })
  glResObs = new ResizeObserver(glOnResize)
  glResObs.observe(wrap)
}

function glDestroy() {
  if (glRafId) {
    cancelAnimationFrame(glRafId)
    glRafId = null
  }
  glResObs?.disconnect()
  glResObs = null
  rootRef.value?.removeEventListener('scroll', glOnScroll)
  if (glScene) glMedias.forEach(m => glScene.removeChild(m.mesh))
  glMedias = []
}

/* ═══════════════════════════════════════════════════════════════════════════
   GSAP Reveal — LandingPage-style ScrollTrigger reveals with SplitText
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
      scroller: container,
      once: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        el.style.visibility = ''

        // SplitText word-colour reveal for .animated-text elements
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
          // Standard reveal-up (y + opacity)
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

/* ─────────────────────────── Watch visible ─────────────────────────────── */
watch(
  () => props.visible,
  async visible => {
    if (!visible) {
      stTriggers.forEach(t => t.kill())
      stTriggers = []
      glDestroy()

      if (canvasWrapRef.value) canvasWrapRef.value.style.opacity = '0'

      if (rootRef.value && gsapInstance) {
        const els = rootRef.value.querySelectorAll('.reveal-up')
        gsapInstance.set(els, { clearProps: 'all' })
        els.forEach(el => { el.style.visibility = '' })
      }
      return
    }

    await nextTick()
    const container = rootRef.value
    if (!container) return

    glInit()
    setTimeout(() => {
      if (glRenderer) {
        glBuildScene()
        if (canvasWrapRef.value && gsapInstance) {
          gsapInstance.fromTo(
            canvasWrapRef.value,
            { opacity: 0, y: 48 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', clearProps: 'y' }
          )
        } else if (canvasWrapRef.value) {
          canvasWrapRef.value.style.opacity = '1'
        }

        // Reveal all WebGL planes sequentially on open (no viewport trigger needed)
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

    const gsap = await ensureGsap()
    const SplitText = SplitTextInstance

    // Animate reveal-up elements: in-viewport cascade on open, below-fold via ScrollTrigger
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
            scroller: container,
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => animateEl(el, 0)
          })
          stTriggers.push(st)
        }
      }
    })
    if (ScrollTrigger) ScrollTrigger.refresh()
  }
)

/* ─────────────────────────── Cleanup ───────────────────────────────────── */
onBeforeUnmount(() => {
  stTriggers.forEach(t => t.kill())
  stTriggers = []
  glDestroy()
})
</script>

<template>
  <Modal
    :visible="props.visible"
    aria-label="Über PULK — der Raum in Halle-Kröllwitz"
    panel-class="!bg-black !rounded-none w-full h-full max-w-none p-0"
    @close="emit('close')"
  >
    <div
      ref="rootRef"
      class="about-wrap modal-scroll"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      <!-- Full-page WebGL canvas — fake-fixed via JS transform in RAF -->
      <div ref="canvasWrapRef" class="gl-canvas-wrap">
        <canvas ref="canvasRef" class="gl-canvas" />
      </div>

      <!-- All non-GL content sits above the canvas -->
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
          <figure class="gl-item img-a" :data-gl-src="gridImgA.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgA.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgA.img.src" :srcset="gridImgA.img.srcset" alt="Heller Innenraum des Pulk in Halle mit drei großen Fenstern und halbtransparenten Vorhängen" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-b" :data-gl-src="gridImgB.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgB.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgB.img.src" :srcset="gridImgB.img.srcset" alt="Blick durch die Schiebetür vom Podest in den Hauptbereich des Pulk mit aufgebauten Stuhlreihen" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-c" :data-gl-src="gridImgC.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgC.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgC.img.src" :srcset="gridImgC.img.srcset" alt="Geöffnete Teeküche im Pulk mit Kaffeemaschine, Spülbecken und Geschirr für Workshops" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-j" :data-gl-src="gridImgJ.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgJ.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgJ.img.src" :srcset="gridImgJ.img.srcset" alt="Treppe hinauf zum Podest im Pulk mit Kisten und halb zugezogenem Vorhang" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-d" :data-gl-src="gridImgD.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgD.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgD.img.src" :srcset="gridImgD.img.srcset" alt="Weitwinkelansicht des Pulk Richtung Eingangstür mit einzelnen Tischen und Sitzgelegenheiten" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-e" :data-gl-src="gridImgE.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgE.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgE.img.src" :srcset="gridImgE.img.srcset" alt="Podestbereich im Pulk mit Tischen und Sitzgelegenheiten, abgetrennt vom Hauptraum" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-f" :data-gl-src="gridImgF.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgF.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgF.img.src" :srcset="gridImgF.img.srcset" alt="Eingangsperspektive im Pulk mit drei einzelnen Tischen, eine Person läuft durchs Bild" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-g" :data-gl-src="gridImgG.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgG.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgG.img.src" :srcset="gridImgG.img.srcset" alt="Aufgestellte Stuhlreihen im Pulk mit Blick auf das Rednerpult für Seminare und Vorträge" loading="lazy" decoding="async" />
            </picture>
          </figure>
          <figure class="gl-item img-h" :data-gl-src="gridImgH.img.src">
            <picture>
              <source v-for="(srcset, format) in gridImgH.sources" :key="format" :srcset="srcset" :type="`image/${format}`" />
              <img :src="gridImgH.img.src" :srcset="gridImgH.img.srcset" alt="Offenes Podest im Pulk ohne Raumtrennung mit einer Reihe Tische, Lampen und Sitzgelegenheiten" loading="lazy" decoding="async" />
            </picture>
          </figure>
        </section>

      <!-- Bottom Section: Foto links · Text-Card rechts -->
      <section class="about-bottom">
        <figure class="gl-item img-i" :data-gl-src="gridImgI.img.src">
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
            </p>
          </div>
          <span class="dot dot-bl"></span>
          <span class="dot dot-br"></span>
        </div>
      </section>

      </div><!-- /.modal-content -->
    </div>
  </Modal>
</template>

<style scoped>
/* ---- Base ---- */
.about-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  color: #fff;
  overflow-y: auto;
  background: #141414;
  padding-bottom: 6rem;
}

.modal-scroll {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scroll-behavior: auto;
  max-height: 100dvh;
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
   WebGL — full-page canvas + gl-item layer
   ════════════════════════════════════════════════════════ */

/* Canvas starts at the top of .about-wrap (position:absolute).
   JS translates it by scrollTop each RAF to keep it viewport-fixed. */
.gl-canvas-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
}

.gl-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  /* iOS Safari Repaint-Fix bei position:absolute + JS translateY:
     eigene GPU-Compositing-Layer erzwingen */
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* All content (text, layout) floats above the canvas */
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

/* ---- Image Cards (shared) ---- */
.img-card {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: 1.25rem;
}

.img-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  /* Inner-Scroll-Fragment auf Mobile entfernen, sodass das Modal dem
     gleichen window-scroll-Pattern folgt wie PricingModal/ContactModal
     (siehe App.vue: #app wird bei Modal-Open ausgeblendet, damit Window
     die Modal-Page scrollt → iOS Safari Toolbar reagiert dynamisch).
     Zuvor scrollte AboutModal intern (.about-wrap{overflow-y:auto;
     height:100%} + .modal-scroll{max-height:100dvh}), wodurch die
     URL-Pille statisch blieb. */
  .about-wrap {
    overflow-y: visible;
    height: auto;
    padding-bottom: env(safe-area-inset-bottom, 0rem);
  }
  .modal-scroll {
    max-height: none;
  }

  /* WebGL-Canvas auf Mobile deaktivieren: Der RAF-translateY-Trick (siehe
     glTick) desynchronisiert mit dem iOS-Compositor-Scroll und zeigt
     einen zitternden schwarzen Balken über den Bildern. Stattdessen die
     echten <picture>/<img>-Elemente sichtbar machen — sie sind im DOM
     bereits vorhanden, nur per visibility:hidden ausgeblendet. */
  .gl-canvas-wrap { display: none; }
  .gl-item { visibility: visible; }
  .gl-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
</style>
