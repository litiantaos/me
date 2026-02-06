<template>
  <UiLayout title="人生">
    <div class="mb-12 space-y-6">
      <div class="flex items-baseline gap-4">
        <div class="text-5xl font-bold">{{ currentAge }}</div>
        <div class="text-2xl text-zinc-300">/</div>
        <div class="text-2xl text-zinc-400">{{ totalLifeYears }}</div>
        <div>年</div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span> {{ passedDays }} 天 （{{ lifeProgressPercentage }}%） </span>
          <span class="text-zinc-400">
            {{ Math.floor(totalLifeYears * 365.25) }} 天
          </span>
        </div>
        <div class="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-600">
          <div
            class="h-1 rounded-full bg-zinc-600 dark:bg-zinc-200"
            :style="{ width: lifeProgressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <p class="text-justify text-zinc-500">{{ description }}</p>
    </div>

    <table class="w-full table-fixed border-collapse">
      <tbody>
        <tr v-for="year in years" :key="year">
          <td class="w-10 text-zinc-400">{{ year }}</td>
          <td v-for="month in 12" :key="`${year}-${month}`" class="py-3">
            <div
              class="ml-auto h-4 w-4 rounded-sm"
              :class="
                isMonthPassed(year, month) ? 'bg-blue-400' : 'bg-zinc-200'
              "
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </UiLayout>
</template>

<script setup>
const { currentAge } = useProfile()
const {
  public: { birthDate },
} = useRuntimeConfig()

const totalLifeYears = 88

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const currentTotalMonths = currentYear * 12 + currentMonth

const birthday = computed(() => parseLocalDate(birthDate))
const birthYear = computed(() => birthday.value?.getFullYear() ?? currentYear)
const birthMonth = computed(() => (birthday.value?.getMonth() ?? -1) + 1)
const birthTotalMonths = computed(() => birthYear.value * 12 + birthMonth.value)

const years = computed(() =>
  Array.from({ length: totalLifeYears }, (_, i) => birthYear.value + i),
)

const passedDays = computed(() =>
  birthday.value ? Math.floor((now - birthday.value) / 86400000) : 0,
)

const lifeProgressPercentage = computed(() => {
  if (!birthday.value) return 0
  const totalDays = totalLifeYears * 365.25
  return Math.min(((passedDays.value / totalDays) * 100).toFixed(1), 100)
})

const isMonthPassed = (year, month) => {
  if (!birthday.value) return false
  const cellValue = year * 12 + month
  return cellValue >= birthTotalMonths.value && cellValue <= currentTotalMonths
}

const description = '努力灿烂的活到 88 岁，看看那时世界的样子。'

useSeoMeta({
  title: '人生',
  description: `人生时间格，${description}`,
})
</script>
