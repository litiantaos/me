<template>
  <NuxtPage />
</template>

<script setup>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk}｜TaosLife` : 'TaosLife'
  },
})
</script>
