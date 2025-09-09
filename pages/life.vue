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
    </div>

    <table class="w-full table-fixed border-collapse">
      <tbody>
        <tr v-for="year in years" :key="year">
          <td class="w-[42px] text-zinc-400">{{ year }}</td>
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
const { birthDate, currentAge } = useAge()
const totalLifeYears = 88

// 缓存日期对象
const today = new Date()
const birthDateObj = new Date(birthDate)
const birthYear = birthDateObj.getFullYear()
const birthMonth = birthDateObj.getMonth() + 1
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

// 计算年份列表
const years = computed(() =>
  Array.from({ length: totalLifeYears }, (_, i) => birthYear + i),
)

// 判断月份是否已经过去
const isMonthPassed = (year, month) => {
  // 如果是出生年，只有出生月及之后的月份才计算
  if (year === birthYear && month < birthMonth) return false

  return year < currentYear || (year === currentYear && month <= currentMonth)
}

// 计算已过去的天数
const passedDays = computed(() =>
  Math.floor((today - birthDateObj) / (1000 * 60 * 60 * 24)),
)

// 计算生命进度百分比
const lifeProgressPercentage = computed(() => {
  const passedMonths =
    (currentYear - birthYear) * 12 + (currentMonth - birthMonth)
  const percentage = (passedMonths / (totalLifeYears * 12)) * 100
  return Math.min(Math.round(percentage * 10) / 10, 100)
})

useSeoMeta({
  title: '人生',
  description: '人生时间格，我会努力灿烂的活到88岁，看看那时世界的样子。',
})
</script>
