<template>
  <div class="flex h-screen w-full flex-col items-center justify-center gap-10">
    <NuxtLink to="/">
      <UiTitle />
    </NuxtLink>

    <h2 class="text-stroke text-3xl font-bold text-transparent">
      {{ error.statusCode }}
    </h2>

    <p>{{ error.message }}</p>
  </div>
</template>

<script setup>
defineProps(['error'])
</script>

<style scoped>
.text-stroke {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #aaa;
}
</style>
