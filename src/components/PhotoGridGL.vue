<script setup>
/**
 * PhotoGridGL.vue — WebGL Infinite Scrolling Gallery
 * Codrops-style sine-wave bend via OGL + GLSL vertex shader.
 *
 * TO REMOVE: delete this file and revert AboutModal.vue
 *   (see the "── GL SWAP ──" comments in AboutModal.vue)
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture, Vec2 } from 'ogl'

const props = defineProps({
  /** Array of { src: string, alt: string } */
  images: { type: Array, required: true },
  /** Pass visible prop so we pause RAF when modal is closed */
  active: { type: Boolean, default: false }
})

/* ─────────────────────────── GLSL Shaders ──────────────────────────── */
const VERT = /* glsl */`
  #define PI 3.14159265358979323846

  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uStrength;
  uniform vec2  uViewportSizes;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 newPos = modelViewMatrix * vec4(position, 1.0);
    newPos.z += sin(newPos.y / uViewportSizes.y * PI + PI / 2.0) * -uStrength;
    gl_Position = projectionMatrix * newPos;
  }
`

const FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D tMap;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(tMap, vUv);
  }
`

/* ─────────────────────────── Constants ─────────────────────────────── */
const COLS       = 3
const GAP        = 24       // px between planes
const IMG_ASPECT = 3 / 4    // portrait images
const EASE       = 0.06     // scroll lerp factor
const AUTO_PX    = 0.5      // px per frame auto-scroll
const STR_SCALE  = 14       // velocity → shader strength multiplier

/* ─────────────────────────── State ─────────────────────────────────── */
const wrapRef   = ref(null)
const canvasRef = ref(null)

let renderer, gl, camera, scene
let rafId   = null
let resizeObs = null

// Scroll
const scr = { current: 0, target: 0, last: 0 }
let strength = 0

// Layout cache
let vW = 0, vH = 0, imgW = 0, imgH = 0

// Mesh records: { mesh, program, startY, extra }  (flat, col order: 0,0,0… 1,1,1… 2,2,2…)
let planes = []

/* ─────────────────────────── Helpers ───────────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * t }

function makePlane(src, x, y) {
  const geo = new Plane(gl, { widthSegments: 20, heightSegments: 20 })

  const tex = new Texture(gl, { generateMipmaps: false })
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => { tex.image = img }
  img.src = src

  const prog = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      tMap:          { value: tex },
      uStrength:     { value: 0 },
      uViewportSizes:{ value: new Vec2(vW, vH) }
    }
  })

  const mesh = new Mesh(gl, { geometry: geo, program: prog })
  mesh.scale.x   = imgW
  mesh.scale.y   = imgH
  mesh.position.x = x
  mesh.position.y = y
  scene.addChild(mesh)

  return { mesh, program: prog, startY: y, extra: 0 }
}

/* ─────────────────────────── Build Scene ───────────────────────────── */
function buildScene() {
  // Teardown previous meshes
  planes.forEach(p => scene.removeChild(p.mesh))
  planes = []

  vW = renderer.width
  vH = renderer.height

  imgW = (vW - GAP * (COLS + 1)) / COLS
  imgH = imgW / IMG_ASPECT

  const rowStep    = imgH + GAP
  const rowsNeeded = Math.ceil((vH * 3) / rowStep) + 1

  for (let col = 0; col < COLS; col++) {
    const x = -vW / 2 + GAP * (col + 1) + imgW * col + imgW / 2

    for (let row = 0; row < rowsNeeded; row++) {
      const imgIdx = (col + row * COLS) % props.images.length
      const y      = vH / 2 - imgH / 2 - row * rowStep
      planes.push(makePlane(props.images[imgIdx].src, x, y))
    }
  }
}

/* ─────────────────────────── RAF Loop ──────────────────────────────── */
function tick() {
  rafId = requestAnimationFrame(tick)

  scr.target   += AUTO_PX
  scr.current   = lerp(scr.current, scr.target, EASE)
  const vel     = scr.current - scr.last
  strength      = lerp(strength, vel, 0.15)
  scr.last      = scr.current

  if (!planes.length) return

  // Per-column loop height = rows-per-col × rowStep
  const rowsPerCol  = planes.length / COLS
  const loopHeight  = rowsPerCol * (imgH + GAP)

  planes.forEach(p => {
    const y = p.startY + scr.current + p.extra
    p.mesh.position.y = y

    // Infinite wrap
    if (y + imgH / 2 < -vH / 2) p.extra += loopHeight
    if (y - imgH / 2 >  vH / 2) p.extra -= loopHeight

    p.program.uniforms.uStrength.value      = strength * STR_SCALE
    p.program.uniforms.uViewportSizes.value = new Vec2(vW, vH)
  })

  renderer.render({ scene, camera })
}

/* ─────────────────────────── Resize ────────────────────────────────── */
function onResize() {
  if (!renderer || !wrapRef.value) return
  const { width, height } = wrapRef.value.getBoundingClientRect()
  renderer.setSize(width, height)
  const camZ = (height / 2) / Math.tan((Math.PI / 180) * (camera.fov / 2))
  camera.perspective({ aspect: width / height, near: 0.1, far: camZ * 2 })
  camera.position.z = camZ
  buildScene()
}

/* ─────────────────────────── Wheel ─────────────────────────────────── */
function onWheel(e) {
  scr.target += e.deltaY * 0.6
}

/* ─────────────────────────── Lifecycle ─────────────────────────────── */
onMounted(() => {
  const wrap = wrapRef.value
  if (!wrap) return

  const { width, height } = wrap.getBoundingClientRect()

  renderer = new Renderer({
    canvas: canvasRef.value,
    width,
    height,
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2)
  })
  gl = renderer.gl
  gl.clearColor(0.078, 0.078, 0.078, 1)

  const FOV = 45
  const camZ = (height / 2) / Math.tan((Math.PI / 180) * (FOV / 2))
  camera = new Camera(gl, { fov: FOV, near: 0.1, far: camZ * 2 })
  camera.perspective({ aspect: width / height })
  camera.position.z = camZ

  scene = new Transform()

  buildScene()
  tick()

  wrap.addEventListener('wheel', onWheel, { passive: true })

  resizeObs = new ResizeObserver(onResize)
  resizeObs.observe(wrap)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  rafId = null
  resizeObs?.disconnect()
  wrapRef.value?.removeEventListener('wheel', onWheel)
  planes = []
})

watch(() => props.active, active => {
  if (active && !rafId) tick()
  else if (!active && rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
})
</script>

<template>
  <section
    ref="wrapRef"
    class="photo-grid-gl"
    data-lenis-prevent
    data-lenis-prevent-wheel
  >
    <canvas ref="canvasRef" class="gl-canvas" />
  </section>
</template>

<style scoped>
.photo-grid-gl {
  width: 100%;
  height: 80vh;
  overflow: hidden;
  position: relative;
}

.gl-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
