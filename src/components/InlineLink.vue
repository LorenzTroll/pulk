<script setup>
defineProps({
  to: { type: String, required: true }
})
</script>

<template>
  <RouterLink :to="to" class="inline-link">
    <span class="inline-link__text"><slot /></span>
    <svg
      class="inline-link__arrow"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 7h11M8 3l4 4-4 4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </RouterLink>
</template>

<style scoped>
.inline-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.inline-link__text {
  text-decoration: underline;
  text-decoration-thickness: 0.0625rem;
  text-underline-offset: 0.2rem;
}

.inline-link__arrow {
  width: 0.75em;
  height: 0.75em;
  flex-shrink: 0;
  transform: translateY(0.05em);
  transition: transform 0.2s ease;
}

.inline-link:hover .inline-link__arrow,
.inline-link:focus-visible .inline-link__arrow {
  transform: translate(0.15em, 0.05em);
}

.inline-link:hover {
  opacity: 0.75;
}

.inline-link:focus-visible {
  outline: 0.125rem solid currentColor;
  outline-offset: 0.125rem;
  border-radius: 0.125rem;
}
</style>
