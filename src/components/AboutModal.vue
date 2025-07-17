<script setup>
import { defineProps, defineEmits, ref, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-white.svg'

gsap.registerPlugin(SplitText)

const props = defineProps({
  visible: { type: Boolean, required: true }
})
const emit = defineEmits(['close'])
const paragraphRef = ref(null)

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return
    nextTick(() => {
      // SplitText erzeugt automatisch .gsap-line-Spans (ein Wrapper um jede Zeile)
      const split = new SplitText(paragraphRef.value, { type: "lines", linesClass: "line" })
      const lines = split.lines

      gsap.set(lines, { color: "#888" })
      gsap.to(lines, {
        color: "#fff",
        duration: 0.6,
        ease: "power1.out",
        stagger: 0.3,
        onComplete: () => split.revert()  // clean up nach Animation
      })
    })
  }
)
</script>

<template>
  <Modal
    :visible="props.visible"
    panel-class="!bg-black !rounded-none w-full h-full max-w-none p-0"
    @close="emit('close')"
  >
    <div class="relative w-full h-full text-white overflow-hidden">
      <img
        :src="pulkLogo"
        alt="Logo Pulk"
        class="absolute top-6 left-6 w-12 h-12"
      />

      <div class="text-container">
        <div class="headline-container">
          <h2 class="headline-about">
            RAUM FÜR DEINE<br/>
            WORKSHOPS UND<br/>
            VERANSTALTUNGEN
          </h2>
        </div>
        <div class="paragraph-container">
          <!-- Einfach ein normaler <p> ohne extra spans -->
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
  padding: 0 11rem 11rem;
  gap: 5rem;
  margin-top: 23%;
}

.absolute {
    margin: 2rem;
}

.headline-container,
.paragraph-container {
  flex: 1 1 30%;
}

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
.line {
  display: block;
  color: #888;    /* initial */
  will-change: color;
}
.line.muted {
  color: #555;
}

@media (max-width: 1024px) {
  .text-container {
    padding: 0 6rem 6rem;
    gap: 4rem;
    margin-top: 24vh;
  }

  .headline-about {
    font-size: 2.5rem;
  }
  .paragraph-container {
    flex: 1 1 100%;     
  }
  .paragraph-container p {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .text-container {
    padding: 2rem;
    gap: 4rem;
    margin-top: 22vh;
  }
  .headline-about {
    font-size: 2.5rem;
    line-height: 1.2;
    text-align: left;
  }
  .paragraph-container p {
    font-size: 1.5rem;
    text-align: left;
  }
  .about-close {
    bottom: 16px;
    padding: 10px 20px;
  }
}
</style>
