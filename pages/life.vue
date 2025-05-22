<template>
  <UiLayout title="人生">
    <div class="mb-8 flex items-center font-bold">
      <div>
        <p>{{ passedDays }}</p>
        <p>{{ passedMonths }}</p>
      </div>
      <div class="ml-3 text-gray-400">
        <p>天</p>
        <p>月</p>
      </div>

      <div class="ml-6 space-x-2">
        <span class="text-4xl">{{ totalLifeYears }}</span>
        <span class="text-gray-400">年</span>
        <span class="text-4xl">{{ totalLifeMonths }}</span>
        <span class="text-gray-400">月</span>
      </div>
    </div>

    <table class="w-full table-fixed border-collapse">
      <tbody>
        <tr v-for="(year, index) in years" :key="year">
          <td class="w-[42px] text-gray-400">{{ year }}</td>
          <td v-for="month in 12" :key="`${year}-${month}`" class="py-3">
            <div
              class="ml-auto h-4 w-4 rounded-sm"
              :class="
                isMonthPassed(year, month) ? 'bg-blue-400' : 'bg-gray-200'
              "
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </UiLayout>
</template>

<script setup>
const birthDate = '1998-03-29'
const totalLifeYears = 88

// 计算年份列表
const years = computed(() => {
  const birthYear = new Date(birthDate).getFullYear()
  const years = []
  for (let i = 0; i < totalLifeYears; i++) {
    years.push(birthYear + i)
  }
  return years
})

// 计算总月数
const totalLifeMonths = computed(() => {
  return totalLifeYears * 12
})

// 判断月份是否已经过去
const isMonthPassed = (year, month) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // JavaScript月份从0开始

  const birthDateObj = new Date(birthDate)
  const birthYear = birthDateObj.getFullYear()
  const birthMonth = birthDateObj.getMonth() + 1

  // 如果是出生年，只有出生月及之后的月份才计算
  if (year === birthYear && month < birthMonth) {
    return false
  }

  if (year < currentYear || (year === currentYear && month <= currentMonth)) {
    return true
  }

  return false
}

// 计算已过去的月数
const passedMonths = computed(() => {
  const today = new Date()
  const birthDateObj = new Date(birthDate)

  let months = (today.getFullYear() - birthDateObj.getFullYear()) * 12
  months += today.getMonth() - birthDateObj.getMonth()

  return months
})

// 计算已过去的天数
const passedDays = computed(() => {
  const today = new Date()
  const birthDateObj = new Date(birthDate)

  const diffTime = Math.abs(today - birthDateObj)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

useSeoMeta({
  title: '人生',
  description: '人生时间格，我会努力灿烂的活到88岁，看看那时世界的样子。',
})
</script>
