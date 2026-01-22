<template>
  <div class="flex gap-3">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="[
        'flex h-7 items-center gap-2 rounded-md bg-zinc-100 px-2 dark:bg-zinc-700',
        modelValue === tab.value
          ? 'text-blue-500 dark:text-blue-400'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      <i v-if="tab.icon" :class="tab.icon"></i>
      <span class="text-xs font-medium">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array, // [{ label: 'Name', value: 'val', icon: 'ri-...' }]
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>
