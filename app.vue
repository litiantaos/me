<template>
  <NuxtPage />

  <Analytics />
  <SpeedInsights />
</template>

<script setup>
import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/vue'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk}｜TaosLife` : 'TaosLife'
  },
})
</script>
