<template>
  <NuxtPage />
  <Analytics />
  <SpeedInsights />
</template>

<script setup>
import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>
