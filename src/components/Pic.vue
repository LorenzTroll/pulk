<script setup>
/**
 * Pic — generischer Wrapper für vite-imagetools `as=picture`-Output.
 *
 * Rendert ein <picture> mit AVIF/WebP/Original-<source>-Tags + <img>-Fallback
 * inkl. korrekt gesetzter width/height (für aspect-ratio reservation → kein CLS)
 * und PNG/JPG-srcset für responsive Fallback.
 *
 * Nutzung:
 *   import heroChair from '@/assets/hero-chair.png?w=200;400&format=avif;webp;png&as=picture'
 *
 *   <Pic :image="heroChair" alt="" class="hero-chair" loading="eager" sizes="25vw" />
 *
 * Alle img-Attribute (class, loading, fetchpriority, alt, aria-hidden, sizes,
 * decoding etc.) werden via $attrs an das innere <img> durchgereicht.
 */
defineProps({
  image: { type: Object, required: true }
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <picture>
    <source
      v-for="(srcset, format) in image.sources"
      :key="format"
      :srcset="srcset"
      :type="`image/${format}`"
    />
    <img
      v-bind="$attrs"
      :src="image.img.src"
      :srcset="image.img.srcset"
      :width="image.img.width"
      :height="image.img.height"
      decoding="async"
    />
  </picture>
</template>

<style scoped>
/* picture als transparenter Layout-Wrapper — der innere <img> nimmt
   direkt am Parent-Layout teil (Flex/Grid). Nötig, weil bestehende
   CSS-Selectors wie ".hero-chairs-top > .hero-chairs-top__item" auf
   das img zielen, das jetzt durch die picture-Hülle indirekt geworden
   wäre. display:contents macht picture für Layout unsichtbar. */
picture {
  display: contents;
}
</style>
