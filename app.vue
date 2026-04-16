<template>
  <NuxtPage />
</template>

<script setup>
const route = useRoute()
const {
  public: { siteUrl },
} = useRuntimeConfig()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk}｜TaosLife` : 'TaosLife'
  },
  link: () => [
    {
      rel: 'canonical',
      href: siteUrl + route.path,
    },
  ],
})

useSeoMeta({
  ogImage: () => siteUrl + '/images/card.png',
})
</script>
