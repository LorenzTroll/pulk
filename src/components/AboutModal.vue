<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-white.svg'
gsap.registerPlugin(SplitText)


const props = defineProps({
  visible: { type: Boolean, required: true },
  enterDelay: { type: Number, default: 0 },
  stagger: { type: Number, default: 0.2 }
})
const emit = defineEmits(['close'])

const rootRef = ref(null)
const paragraphRef = ref(null)
let tl

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) {
      tl?.kill(); tl = null
      if (rootRef.value) {
        const els = rootRef.value.querySelectorAll('.reveal-up')
        gsap.set(els, { clearProps: 'transform,opacity,willChange' })
      }
      return
    }

    await nextTick()

    const container = rootRef.value
    if (!container) return

    const targets = Array.from(container.querySelectorAll('.reveal-up'))
    if (!targets.length) return

    let split
    if (paragraphRef.value) {
      split = new SplitText(paragraphRef.value, { type: 'lines', linesClass: 'line' })
    }

    tl?.kill()
    tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power2.out' },
      delay: props.enterDelay
    })

    // Reveal-Up mit respektiertem Basis-Y + optionalem per-Element Delay via data-modal-delay
    tl.fromTo(
      targets,
      {
        y: (i, el) => (Number(gsap.getProperty(el, 'y')) || 0) + 32,
        opacity: 0,
        willChange: 'transform,opacity'
      },
      {
        y: (i, el) => Number(gsap.getProperty(el, 'y')) || 0,
        opacity: 1,
        delay: (i, el) => Number(el.getAttribute('data-modal-delay')) || 0.3,
        stagger: props.stagger,
        clearProps: 'willChange'
      },
      0
    )

    if (split?.lines?.length) {
      tl.set(split.lines, { color: '#888' }, 0.1)
      tl.to(
        split.lines,
        {
          color: '#fff',
          ease: 'power1.out',
          stagger: 0.2,
          duration: 0.6,
          onComplete: () => split.revert()
        },
        0.25 // relative zur Timeline (nach dem globalen Delay)
      )
    }
  }
)

onBeforeUnmount(() => { tl?.kill(); tl = null })
</script>


<template>
  <Modal
    :visible="props.visible"
    panel-class="!bg-black !rounded-none w-full h-full max-w-none p-0"
    @close="emit('close')"
  >
    <div ref="rootRef" class="relative w-full h-full text-white overflow-hidden">
      <img :src="pulkLogo" alt="Logo Pulk" class="absolute top-6 left-6 w-12 h-12" />

      <div class="text-container">
        <div class="headline-container reveal-up">
          <h2 class="headline-about">
            RAUM FÜR DEINE<br />
            WORKSHOPS UND<br />
            VERANSTALTUNGEN
          </h2>
        </div>
        <div class="paragraph-container reveal-up">
          <p ref="paragraphRef">
            Unser Studio ist so gestaltet, dass es vielseitig und modular ist,
            um euch den Freiraum und die Flexibilität zu bieten, die ihr für euer
            Vorhaben braucht. 100 qm für euch, ganz privat, ohne Ablenkung,
            direkt an der Saale. Wenn du wissen möchtest, ob unser Raum für deine
            Idee passt, findest du weitere Infos in unserem FAQ.
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.text-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 15rem 11rem;
  gap: 3rem;
  margin-top: 21%;
}
.absolute { margin: 2rem; }
.headline-container, .paragraph-container { flex: 1 1 30%; }

.headline-about {
  color: #9687FF;
  font-family: 'TWK Everett', sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 3rem);
  margin: 0;
  text-align: left;
}
.paragraph-container p {
  color: white;
  font-family: 'TWK Everett', sans-serif;
  font-weight: 400;
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  line-height: 1.6;
  margin: 0;
}

/* Zeilen für GSAP-Animation */
.line { display: block; color: #888; will-change: color; }
.line.muted { color: #555; }

/* responsive … (deins bleibt) */
@media (max-width: 1024px) {
  .text-container { padding: 0 6rem 6rem; gap: 4rem; margin-top: 24vh; }
  .headline-about { font-size: 2.5rem; }
  .paragraph-container { flex: 1 1 100%; }
  .paragraph-container p { font-size: 1.5rem; }
}
@media (max-width: 640px) {
  .text-container { padding: 2rem; gap: 4rem; margin-top: 22vh; }
  .headline-about { font-size: 2.5rem; line-height: 1.2; text-align: left; }
  .paragraph-container p { font-size: 1.5rem; text-align: left; }
  .about-close { bottom: 16px; padding: 10px 20px; }
}
</style>
