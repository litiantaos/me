<template>
  <NuxtPage />
</template>

<script setup>
const route = useRoute()
const {
  public: { name, siteUrl },
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
  // description 走运行时配置，避免构建期 env 缺失输出 "undefined 的个人网站"
  description: () =>
    name ? `${name}的个人网站，记录想法与生活。` : '个人网站，记录想法与生活。',
  ogImage: () => siteUrl + '/images/card.png',
})
</script>
