<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-white_E3.svg'
import { getGsapWithPlugins } from '@/composables/lazyGsap'

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
const rootRef = ref(null)
const paragraphRef = ref(null)
const cardEls = [] // used for hover scaling

let tl = null               // GSAP timeline
let io = null               // IntersectionObserver instance

// Lazy geladene GSAP-Instanz + SplitText Referenz
let gsapInstance = null
let SplitTextInstance = null

async function ensureGsap() {
  if (gsapInstance) return gsapInstance

  const gsap = await getGsapWithPlugins()
  gsapInstance = gsap
  SplitTextInstance = gsap.core.globals().SplitText

  if (!SplitTextInstance) {
    console.warn('[AboutModal] SplitText not found in GSAP globals')
  }

  return gsap
}

/* -----------------------------------------------------------------------------
 * Images (static assets)
 * ---------------------------------------------------------------------------*/
import aboutA from '@/assets/PULK_250513_Foto_Michel_Klehm_5.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import aboutB from '@/assets/PULK_250513_Foto_Michel_Klehm_6.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import aboutC from '@/assets/PULK_250513_Foto_Michel_Klehm_21.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import aboutD from '@/assets/PULK_250513_Foto_Michel_Klehm_16.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import aboutE from '@/assets/PULK_250513_Foto_Michel_Klehm_17.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

const pics = [
  { picture: aboutA, alt: 'Innenansicht des PULK mit Pflanzen', cls: 'img-a' },
  { picture: aboutB, alt: 'Innenansicht Setup mit mehreren Tischen', cls: 'img-b' },
  { picture: aboutC, alt: 'Ansicht Podest und Einrichtung Raum', cls: 'img-c' },
  { picture: aboutD, alt: 'Treppe führt hoch auf das Podest', cls: 'img-d' },
  { picture: aboutE, alt: 'Ansicht Raum mit zwei Tischen', cls: 'img-e' }
]

/* -----------------------------------------------------------------------------
 * Hover interactions (desktop only)
 * ---------------------------------------------------------------------------*/
const canHover =
  typeof window !== 'undefined'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false

/** Scale cards on hover (desktop only) */
function focusCard(index) {
  if (!canHover || !gsapInstance) return

  const gsap = gsapInstance

  cardEls.forEach((el, i) => {
    if (!el) return
    gsap.to(el, {
      scale: i === index ? 1.2 : 0.9,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    })
  })
}

/** Reset all cards back to neutral scale */
function resetCards() {
  if (!gsapInstance) return
  const gsap = gsapInstance

  cardEls.forEach(el => {
    if (!el) return
    gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' })
  })
}

/* -----------------------------------------------------------------------------
 * Scroll reveal animation for images (IntersectionObserver)
 * ---------------------------------------------------------------------------*/
function setupImageReveal(gsap, scroller, items, opts = {}) {
  const rootMargin = opts.rootMargin ?? '0px 0px -10% 0px'
  const threshold = opts.threshold ?? 0.01

  gsap.set(items, { opacity: 0, y: 24, willChange: 'transform,opacity' })

  io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return

        const el = entry.target
        io.unobserve(el)

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'willChange'
        })
      })
    },
    { root: scroller, threshold, rootMargin }
  )

  items.forEach(el => io.observe(el))
}

/* -----------------------------------------------------------------------------
 * Main animation: Reveal headings & text (SplitText), then image cards
 * ---------------------------------------------------------------------------*/
watch(
  () => props.visible,
  async visible => {
    // When modal closes → cleanup
    if (!visible) {
      tl?.kill()
      tl = null
      io?.disconnect()
      io = null

      if (rootRef.value && gsapInstance) {
        const gsap = gsapInstance
        const els = rootRef.value.querySelectorAll('.reveal-up, .img-card')
        gsap.set(els, { clearProps: 'transform,opacity,willChange' })
      }
      return
    }

    // When modal opens → run animations
    await nextTick()

    const container = rootRef.value
    if (!container) return

    const gsap = await ensureGsap()
    const SplitText = SplitTextInstance

    const revealTargets = [...container.querySelectorAll('.reveal-up')]

    // text splitting
    let split = null
    if (paragraphRef.value && SplitText) {
      split = new SplitText(paragraphRef.value, {
        type: 'lines',
        linesClass: 'line'
      })
    }

    tl?.kill()
    tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power2.out' },
      delay: props.enterDelay
    })

    /* ------------------ Animate headline + paragraph ------------------ */
    tl.fromTo(
      revealTargets,
      {
        y: (i, el) => (Number(gsap.getProperty(el, 'y')) || 0) + 32,
        opacity: 0,
        willChange: 'transform,opacity'
      },
      {
        y: (i, el) => Number(gsap.getProperty(el, 'y')) || 0,
        opacity: 1,
        stagger: props.stagger,
        clearProps: 'willChange'
      },
      0
    )

    /* ------------------ Animate paragraph line-by-line ------------------ */
    if (split?.lines?.length) {
      tl.set(split.lines, { color: '#888' }, 0)
      tl.to(
        split.lines,
        {
          color: '#fff',
          ease: 'power1.out',
          stagger: 0.2,
          duration: 0.6,
          onComplete: () => split.revert()
        },
        0.25
      )
    }

    /* ------------------ Animate images via IntersectionObserver ------------------ */
    const cards = [...container.querySelectorAll('.img-card')]
    setupImageReveal(gsap, container, cards)
  }
)

/* -----------------------------------------------------------------------------
 * Cleanup
 * ---------------------------------------------------------------------------*/
onBeforeUnmount(() => {
  tl?.kill()
  tl = null
  io?.disconnect()
  io = null
})
</script>

<template>
  <Modal
    :visible="props.visible"
    panel-class="!bg-black !rounded-none w-full h-full max-w-none p-0"
    @close="emit('close')"
  >
    <div
      ref="rootRef"
      class="relative w-full h-full text-white overflow-auto modal-scroll"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      <!-- Logo -->
      <img :src="pulkLogo" alt="Logo Pulk" class="absolute top-6 left-6 w-12 h-12" />
      <!-- Text Section -->
      <div class="text-container">
        <div class="headline-container reveal-up">
          <h2 class="headline-about">Von der Idee<br />zum Raum</h2>
        </div>
        <div class="paragraph-container reveal-up" data-modal-delay="0.1">
          <p ref="paragraphRef">
            Ein Jahr Arbeit. Ein Jahr bauen, planen, gestalten, ausprobieren. Damit ein Studio entsteht,
            der mehr ist als vier Wände. Pulk ist gemacht, um sich anzupassen: an Gruppen, an Formate,
            an Ideen. Praktisch im Alltag, wandelbar im Detail. Wohnlich, aber strukturiert. Offen, aber
            fokussiert. Ein Stück Handwerk. Ein Stück Design. Damit Begegnung einen neuen Raum findet,
            Menschen zusammenbringt, Austausch ermöglicht, Bewegung startet.
          </p>
        </div>
      </div>
      <!-- Image Grid -->
      <section class="images-grid reveal-up">
        <figure
          v-for="(p, i) in pics"
          :key="p.cls"
          :class="['img-card', p.cls]"
          :ref="el => (cardEls[i] = el)"
          @mouseenter="focusCard(i)"
          @mouseleave="resetCards"
        >
          <div class="img-inner">
            <picture>
              <source
                v-for="src in p.picture.sources"
                :key="src.type"
                :srcset="src.srcset"
                :type="src.type"
              />
              <img
                :src="p.picture.img.src"
                :srcset="p.picture.img.srcset"
                :width="p.picture.img.width"
                :height="p.picture.img.height"
                :alt="p.alt"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </figure>
      </section>
    </div>
  </Modal>
</template>

<style scoped>
/* -----------------------------------------------------------------------------
 * Layout / Global Container
 * ---------------------------------------------------------------------------*/

.modal-scroll {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scroll-behavior: auto;
  max-height: 100dvh;
}

.absolute {
  margin: 2rem;
  width: max(7rem, 9%);
}

/* -----------------------------------------------------------------------------
 * Typography & Text Layout
 * ---------------------------------------------------------------------------*/

.text-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10rem;
  margin-top: 20%;
}

.headline-about {
  color: #9687ff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.06rem;
  font-size: clamp(2rem, 3vw, 3.2rem);
  margin: 0;
}

.paragraph-container p {
  color: #fff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  line-height: 1.5;
  word-spacing: 0.15rem;
  margin: 0;
  width: 40vw;
}

.line {
  display: block;
  color: #888;
}

/* -----------------------------------------------------------------------------
 * Image Grid Layout
 * ---------------------------------------------------------------------------*/

.images-grid {
  width: min(1400px, 92vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0 1rem;
}

.img-card {
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
  transform: translateZ(0);
  will-change: transform;
}

.img-inner {
  width: 100%;
  height: 100%;
  transform-origin: center;
}

.img-card img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 1rem;
}

/* Desktop positioning for each image */
.img-a {
  grid-column: 1 / span 3;
  margin-top: 6rem;
  margin-left: 5rem;
}

.img-b {
  grid-column: 9 / span 3;
  margin-top: 12rem;
}

.img-c {
  grid-column: 2 / span 6;
  margin-top: 0rem;
}

.img-d {
  grid-column: 8 / span 4;
  margin-top: 30rem;
}

.img-e {
  grid-column: 1 / span 4;
  margin-top: -10rem;
}

/* Hover scaling fallback */
@media (hover:hover) and (pointer:fine) {
  .img-card {
    transition: transform 0.1s ease;
  }
  .img-card:hover {
    transform: scale(1.5);
  }
}

/* -----------------------------------------------------------------------------
 * Tablet View
 * ---------------------------------------------------------------------------*/
@media (min-width: 641px) and (max-width: 1024px) {
  .text-container {
    padding: 0 5rem 4rem;
    margin-top: 16%;
    gap: 3rem;
  }

  .images-grid {
    gap: 2.5rem 2rem;
    width: min(1100px, 88vw);
  }

  /* Keep visual scaling consistent */
  .img-inner {
    transform: scale(0.88);
  }

  .img-a {
    grid-column: 1 / span 6;
    margin-top: 3rem;
    margin-left: 4rem;
  }
  .img-b {
    grid-column: 9 / span 9;
    margin-top: 4rem;
  }
  .img-c {
    grid-column: 2 / span 8;
    margin-top: -2rem;
  }
  .img-d {
    grid-column: 8 / span 9;
    margin-top: -10rem;
    margin-left: 7rem;
  }
  .img-e {
    grid-column: 1 / span 10;
    margin-top: 0rem;
    margin-left: 2rem;
  }

  .images-grid {
    --grid-max-h: 185vh;
    max-height: var(--grid-max-h);
  }
}

/* -----------------------------------------------------------------------------
 * Smartphone View
 * ---------------------------------------------------------------------------*/
@media (max-width: 640px) {
  .text-container {
    padding: 0 1.25rem 2.5rem;
    margin-top: 14%;
    gap: 1.25rem;
  }

  .headline-container,
  .paragraph-container {
    flex: 1 1 100%;
  }

  .headline-about {
    font-size: clamp(2.5rem, 6vw, 3rem);
    margin: 5rem 0 1.9rem;
    line-height: 3.3rem;
  }

  .paragraph-container p {
    font-size: clamp(1.5rem, 3.6vw, 1.05rem);
    margin-bottom: 3rem;
    width: 90vw;
  }

  .images-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    width: 100%;
    max-height: none;
  }

  .img-card {
    width: 96vw;
    margin: 0 auto;
    border-radius: 16px;
  }

  .img-card img {
    border-radius: inherit;
  }

  .img-card:hover {
    transform: none !important;
  }
}
</style>
