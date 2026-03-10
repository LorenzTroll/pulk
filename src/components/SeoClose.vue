<script setup>
// Kein JS nötig – Router-Link reicht
</script>

<template>
  <router-link to="/" class="seo-close">
    <span class="close-line line-1"></span>
    <span class="close-line line-2"></span>
  </router-link>
</template>

<style scoped>
.seo-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 2.3rem;
  height: 2.3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 5000;
}

/* Grundlinien – identisch in beiden, Rotation kommt über die Animation */
.close-line {
  position: absolute;
  width: 100%;
  height: 3px;
  background-color: #FF464E;
  border-radius: 2px;
  transform-origin: center;
  opacity: 0;

  /* Animation läuft automatisch einmal nach 2s */
  animation-name: draw-line;
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  animation-fill-mode: forwards;
  animation-delay: 2s;
}

/* leichte zeitliche Staffelung */
.line-2 {
  animation-delay: 2.12s;
}

/* Hover → nur Farbe ändern, Animation nicht erneut auslösen */
.seo-close:hover .close-line {
  background-color: #9687ff;
}

/* Keyframes:
   - Start: unsichtbar, skaliert auf 0
   - Mitte: leicht überziehen (1.08)
   - Ende: bei normaler Länge & finaler Rotation
*/
@keyframes draw-line {
  0% {
    opacity: 0;
    transform: scaleX(0) rotate(0deg);
  }
  60% {
    opacity: 1;
    transform: scaleX(1.08) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scaleX(1) rotate(45deg);
  }
}

/* Wichtig:
   Wir geben beiden Linien dieselbe Animation, drehen aber das X
   dadurch, dass eine Linie invertiert wird – per Extra-Wrapper-Animation:
*/
.line-1 {
  /* gleiche Animation, aber wir drehen sie am Ende durch ein zusätzliches Transform */
  animation-name: draw-line-line1;
}
.line-2 {
  animation-name: draw-line-line2;
}

@keyframes draw-line-line1 {
  0% {
    opacity: 0;
    transform: scaleX(0) rotate(0deg);
  }
  60% {
    opacity: 1;
    transform: scaleX(1.08) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scaleX(1) rotate(45deg);
  }
}

@keyframes draw-line-line2 {
  0% {
    opacity: 0;
    transform: scaleX(0) rotate(0deg);
  }
  60% {
    opacity: 1;
    transform: scaleX(1.08) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scaleX(1) rotate(-45deg);
  }
}
</style>
