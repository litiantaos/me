<template>
  <div class="relative h-80 w-full select-none" ref="containerRef">
    <!-- 悬停数据 -->
    <div class="flex h-8 items-center gap-2">
      <div v-if="hoverData" class="text-blue-500 dark:text-blue-400">
        <span>{{ hoverData.label }}: </span>
        <span class="font-bold">{{ hoverData.value }}</span>
      </div>
    </div>

    <svg
      v-if="chartData && gradientId"
      class="block h-full w-full"
      @mousemove="handlePointerMove"
      @touchstart.prevent="handlePointerMove"
      @touchmove.prevent="handlePointerMove"
      @mouseleave="handleMouseLeave"
      @touchend="handleMouseLeave"
    >
      <!-- Y轴刻度线和标签 -->
      <g v-for="(tick, index) in yTicks" :key="`tick-${index}`">
        <line
          :x1="padding.left"
          :y1="getTickY(tick)"
          :x2="width"
          :y2="getTickY(tick)"
          :class="
            index === 0
              ? 'stroke-zinc-200 dark:stroke-zinc-600'
              : 'stroke-zinc-100 dark:stroke-zinc-700'
          "
          stroke-width="1"
        />
        <text
          v-if="showYAxis"
          :x="padding.left - 6"
          :y="getTickY(tick)"
          class="fill-zinc-400 text-xs"
          text-anchor="end"
          dominant-baseline="middle"
        >
          {{ formatYAxisValue(tick) }}
        </text>
      </g>

      <!-- X轴标签（首尾） -->
      <g v-for="(label, i) in visibleXLabels" :key="`xlabel-${i}`">
        <text
          :x="label.x"
          :y="height - 5"
          class="fill-zinc-400 text-xs dark:fill-zinc-500"
          :text-anchor="label.anchor"
        >
          {{ label.text }}
        </text>
      </g>

      <!-- 渐变定义 -->
      <defs>
        <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 曲线和面积 -->
      <g v-if="points.length > 0">
        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path
          :d="linePath"
          class="fill-none stroke-blue-500 dark:stroke-blue-400"
          :stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      <!-- 悬停指示线与点 -->
      <g v-if="hoverIndex !== -1 && points[hoverIndex]">
        <line
          :x1="points[hoverIndex].x"
          :y1="padding.top"
          :x2="points[hoverIndex].x"
          :y2="height - padding.bottom"
          class="stroke-blue-400/50"
          stroke-width="1"
          stroke-dasharray="4"
        />
        <circle
          :cx="points[hoverIndex].x"
          :cy="points[hoverIndex].y"
          :r="5"
          class="fill-blue-500 stroke-white dark:fill-blue-400 dark:stroke-zinc-800"
          :stroke-width="2"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, required: true },
  showYAxis: { type: Boolean, default: false },
})

// 渐变ID（确保多实例唯一性）
const gradientId = ref(null)

const containerRef = ref(null)
const width = ref(0)
const height = ref(0)
const hoverIndex = ref(-1)

// 图表内边距
const padding = computed(() => ({
  top: 10,
  right: 0,
  bottom: 24,
  left: props.showYAxis ? 36 : 0,
}))

// 计算美观的刻度值
const getNiceNumber = (value, round = false) => {
  const exp = Math.floor(Math.log10(value))
  const fraction = value / Math.pow(10, exp)
  let niceFraction

  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }

  return niceFraction * Math.pow(10, exp)
}

// 计算值域和刻度
const valueRange = computed(() => {
  const values = props.data.map((d) => Number(d.value) || 0)
  if (values.length === 0) return null

  let min = Math.min(...values)
  let max = Math.max(...values)
  let range = max - min

  // 处理所有值相同的情况
  if (range === 0) {
    max += 10
    min = Math.max(0, min - 10)
    range = max - min
  }

  // 计算美观的刻度间隔
  const tickSpacing = getNiceNumber(range / 5, true)
  min = Math.floor(min / tickSpacing) * tickSpacing
  max = Math.ceil(max / tickSpacing) * tickSpacing

  // 生成刻度数组
  const ticks = []
  for (let i = min; i <= max; i += tickSpacing) {
    ticks.push(Number(i.toFixed(10))) // 避免浮点精度问题
  }

  return { min, max, values, ticks }
})

// 计算图表可用尺寸
const chartDimensions = computed(() => {
  const p = padding.value
  return {
    w: Math.max(0, width.value - p.left - p.right),
    h: Math.max(0, height.value - p.top - p.bottom),
  }
})

// 计算所有点的坐标
const chartData = computed(() => {
  const range = valueRange.value
  const dims = chartDimensions.value
  if (!range) return null

  const { min, max, values, ticks } = range
  const { w, h } = dims
  const p = padding.value

  // 计算X轴步长
  const stepX = w / (values.length > 1 ? values.length - 1 : 1)

  // 映射数据点到SVG坐标
  const points = values.map((val, i) => ({
    x: p.left + i * stepX,
    y: p.top + h - ((val - min) / (max - min || 1)) * h,
    value: val,
    original: props.data[i],
  }))

  return { min, max, ticks, points, w, h }
})

// 导出各计算属性（简化模板访问）
const yTicks = computed(() => chartData.value?.ticks || [])
const points = computed(() => chartData.value?.points || [])

// 格式化Y轴数值显示
const formatYAxisValue = (val) => {
  const abs = Math.abs(val)
  if (abs >= 1000) return (val / 1000).toFixed(1) + 'k'
  return Number.isInteger(val) ? val : val.toFixed(1)
}

// 获取刻度线的Y坐标
const getTickY = (val) => {
  const data = chartData.value
  if (!data) return 0
  const p = padding.value
  return (
    p.top + data.h - ((val - data.min) / (data.max - data.min || 1)) * data.h
  )
}

// 生成贝塞尔曲线路径
const linePath = computed(() => {
  const p = points.value
  if (p.length === 0) return ''

  // 单点情况：绘制一个点（技术上是极短的线段）
  if (p.length === 1) {
    return `M${p[0].x},${p[0].y} L${p[0].x},${p[0].y}`
  }

  const segments = [`M${p[0].x},${p[0].y}`]

  // 使用三次贝塞尔曲线平滑连接各点
  for (let i = 0; i < p.length - 1; i++) {
    const curr = p[i]
    const next = p[i + 1]
    const dx = next.x - curr.x
    const cp1x = curr.x + dx / 3
    const cp2x = curr.x + (dx * 2) / 3
    segments.push(`C${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`)
  }

  return segments.join(' ')
})

// 生成填充面积路径
const areaPath = computed(() => {
  if (!linePath.value || points.value.length === 0) return ''
  const p = points.value
  const bottomY = height.value - padding.value.bottom

  // 从曲线路径末端向下到底部，再连回起点
  return `${linePath.value} L${p[p.length - 1].x},${bottomY} L${p[0].x},${bottomY} Z`
})

// 生成X轴标签（仅首尾）
const visibleXLabels = computed(() => {
  const p = points.value
  if (p.length === 0) return []

  const labels = [{ text: p[0].original.label, x: p[0].x, anchor: 'start' }]

  // 多于一个点时显示末尾标签
  if (p.length > 1) {
    labels.push({
      text: p[p.length - 1].original.label,
      x: p[p.length - 1].x,
      anchor: 'end',
    })
  }

  return labels
})

// 当前悬停的数据点
const hoverData = computed(() =>
  hoverIndex.value !== -1 ? points.value[hoverIndex.value]?.original : null,
)

// 更新悬停状态
const updateHover = (clientX) => {
  if (clientX === undefined) {
    hoverIndex.value = -1
    return
  }

  const rect = containerRef.value?.getBoundingClientRect()
  const data = chartData.value
  if (!rect || !data || data.w <= 0 || points.value.length === 0) {
    hoverIndex.value = -1
    return
  }

  // 计算相对于图表区域的X坐标
  const relX = Math.max(
    0,
    Math.min(data.w, clientX - rect.left - padding.value.left),
  )

  // 映射到最近的数据点索引
  const rawIndex = (relX / data.w) * (points.value.length - 1)
  hoverIndex.value = Math.round(rawIndex)
}

// 处理指针移动事件（鼠标和触摸）
const handlePointerMove = (e) => {
  const clientX =
    e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX
  updateHover(clientX)
}

// 处理指针离开事件
const handleMouseLeave = () => {
  hoverIndex.value = -1
}

let resizeObserver = null
let rafId = null

onMounted(() => {
  // 生成唯一渐变ID
  gradientId.value = `area-gradient-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  if (!containerRef.value) return

  // 更新容器尺寸（使用RAF避免频繁重绘）
  const updateSize = () => {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height
  }

  // 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(updateSize)
  })

  resizeObserver.observe(containerRef.value)
  updateSize()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
})
</script>
