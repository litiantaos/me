<template>
  <UiLayout title="笔记统计" :isLoading="isLoading">
    <div v-if="data" class="space-y-8">
      <!-- 统计 -->
      <div>
        <p class="text-base font-bold">
          总计 {{ data.stats.totalNotes }} 篇笔记
        </p>
        <p>
          {{ data.stats.maxMonth }}
          最多，共 {{ data.stats.maxCount }} 篇
        </p>
      </div>

      <!-- 图表 -->
      <UiChart :data="data.chartData" />
    </div>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()

const { data, pending: isLoading } = await useLazyAsyncData(async () => {
  const { data: notes } = await client
    .from('notes')
    .select('created_at')
    .order('created_at', { ascending: true })

  if (notes) {
    const monthCounts = {}

    notes.forEach((note) => {
      const date = new Date(note.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })

    const chartData = Object.entries(monthCounts).map(([month, count]) => ({
      label: month,
      value: count,
    }))

    // 计算统计信息
    const totalNotes = notes.length
    let maxMonth = ''
    let maxCount = 0

    Object.entries(monthCounts).forEach(([month, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxMonth = month
      }
    })

    return {
      chartData,
      stats: {
        totalNotes,
        maxMonth,
        maxCount,
      },
    }
  }
})

useHead({
  title: '笔记统计',
})
</script>
