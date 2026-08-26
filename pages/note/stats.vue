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

    <!-- 未登录空态 -->
    <div
      v-else-if="!isLoading && !user"
      class="flex h-[50vh] items-center justify-center text-zinc-400"
    >
      登录后可查看统计数据
    </div>
  </UiLayout>
</template>

<script setup>
const user = useSupabaseUser()
const { fetchNotesData } = useNotes()

const { data, pending: isLoading } = await useLazyAsyncData(
  async () => {
    // 未登录时不发起请求
    if (!user.value) return null

    const notes = await fetchNotesData('created_at')

    if (!notes || notes.length === 0) {
      return null
    }

    // 按月份分组统计
    const monthCounts = {}
    notes.forEach((note) => {
      const date = new Date(note.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })

    // 找出笔记最多的月份
    let maxMonth = ''
    let maxCount = 0
    Object.entries(monthCounts).forEach(([month, count]) => {
      if (count > maxCount) {
        maxMonth = month
        maxCount = count
      }
    })

    // 生成图表数据
    const chartData = Object.entries(monthCounts).map(([month, count]) => ({
      label: month,
      value: count,
    }))

    return {
      chartData,
      stats: {
        totalNotes: notes.length,
        maxMonth,
        maxCount,
      },
    }
  },
  // 登录状态变化时重新获取
  { watch: [user] },
)

useSeoMeta({
  title: '笔记统计',
})
</script>
