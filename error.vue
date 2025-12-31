<template>
  <UiLayout titleAlign="justify-center" class="mt-[40vh]">
    <div class="space-y-10 text-center">
      <h2 class="text-stroke text-3xl font-bold text-transparent">
        {{ error.statusCode }}
      </h2>

      <p>{{ error.message }}</p>
    </div>
  </UiLayout>
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
