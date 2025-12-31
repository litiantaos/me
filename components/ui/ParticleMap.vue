<template>
  <canvas ref="canvasRef" class="block h-screen w-full"></canvas>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
})

const canvasRef = ref(null)

// 核心配置参数
const CONFIG = {
  particleGap: 2, // 桌面端采样间隔
  mobileGap: 6, // 移动端采样间隔
  fov: 800, // 视场深度
  baseSize: 2, // 陆地粒子大小
  citySize: 5, // 城市粒子大小
  mouseRadiusSq: 8100, // 交互范围平方 (90px)
  viscosity: 0.1, // 粘滞系数
  maxRotation: 0.5, // 最大倾斜角度
  minZoom: 0.8, // 允许缩小到 0.8 倍
  maxZoom: 12, // 允许放大到 12 倍
  initialScale: 1.2, // 基础缩放比例
  defaultZoom: 3.2, // 默认显示层级
  centerLat: 35, // 视图中心纬度
  centerLon: 105, // 视图中心经度
  colors: {
    light: {
      land: '#334155',
      city: '#fbbf24',
    },
    dark: {
      land: '#a1a1aa', // Zinc 400
      city: '#fbbf24',
    },
  },
  // 投影偏移修正
  projectionOffset: {
    lat: 5,
    lon: 0,
  },
  // 城市放大效果
  cityMagnify: 3, // 城市放大倍数
  // 陆地排斥效果 (模拟拨开沙子的感觉)
  landRepulsion: 15, // 陆地偏移强度
  springStiffness: 0.1, // 弹性系数
  springDamping: 0.8, // 阻尼
  // 点击波纹效果
  waveSpeed: 15,
  waveWidth: 60,
  waveForce: 40, // 斥力强度
}

let ctx = null
let width = 0
let height = 0
let halfW = 0
let halfH = 0

let landParticles = null
let cityParticles = []
let waves = [] // 存储活跃的波纹
let animationId = null
let cachedPixelData = null // 缓存像素数据
let worldImage = null
let mediaQuery = null
let mapCenter = { x: 0, y: 0 } // 地图中心偏移量

// 交互状态
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
const zoom = { current: CONFIG.defaultZoom, target: CONFIG.defaultZoom }
const touch = { lastDist: 0 }
const isDark = ref(false)
let baseScale = 1
let isMobile = false

// 经纬度投影转换
const project = (lat, lon) => ({
  x: (lon + CONFIG.projectionOffset.lon + 180) * (800 / 360) - 400,
  y: (90 - (lat + CONFIG.projectionOffset.lat)) * (400 / 180) - 200,
})

const createParticle = (x, y, isCity = false) => {
  return {
    x,
    y,
    oz: isCity ? -20 : 0,
    dx: 0,
    dy: 0,
    currentScale: 0,
    velocityScale: 0,
  }
}

const loadMapImage = () => {
  if (worldImage) return Promise.resolve(worldImage)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = '/images/world.svg'
    img.onload = () => {
      worldImage = img
      resolve(img)
    }
    img.onerror = (e) => {
      reject(e)
    }
  })
}

const getPixelData = async () => {
  if (cachedPixelData) return cachedPixelData

  const img = await loadMapImage()
  const mapW = 800
  const mapH = 400
  const offCanvas = document.createElement('canvas')
  offCanvas.width = mapW
  offCanvas.height = mapH
  const offCtx = offCanvas.getContext('2d')

  offCtx.fillStyle = '#fff'
  offCtx.fillRect(0, 0, mapW, mapH)
  offCtx.drawImage(img, 0, 0, mapW, mapH)

  cachedPixelData = offCtx.getImageData(0, 0, mapW, mapH).data
  return cachedPixelData
}

const initParticles = async () => {
  try {
    const data = await getPixelData()
    const mapW = 800
    const mapH = 400

    cityParticles = []
    isMobile = window.innerWidth < 768
    const gap = isMobile ? CONFIG.mobileGap : CONFIG.particleGap

    // 计算中心偏移
    mapCenter = project(CONFIG.centerLat, CONFIG.centerLon)

    // 使用普通数组暂存坐标，比对象数组节省内存和GC
    const vertices = []

    // 生成陆地粒子
    for (let y = 0; y < mapH; y += gap) {
      for (let x = 0; x < mapW; x += gap) {
        if (data[(y * mapW + x) * 4] < 240) {
          const px = x - mapW / 2 - mapCenter.x
          const py = y - mapH / 2 - mapCenter.y

          vertices.push(px, py, 0, 0)
        }
      }
    }

    // 转存到 TypedArray
    landParticles = new Float32Array(vertices)

    updateCityParticles()

    // 数据准备完毕，启动渲染循环
    if (!animationId) {
      render()
    }
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

const updateCityParticles = () => {
  cityParticles = []
  if (!mapCenter) return
  props.data.forEach((city) => {
    const { x, y } = project(city.latitude, city.longitude)
    cityParticles.push(createParticle(x - mapCenter.x, y - mapCenter.y, true))
  })
}

// 监听城市数据变化
watch(() => props.data, updateCityParticles, { deep: true })

const drawCityParticle = (x, y, size, color) => {
  ctx.fillStyle = color
  ctx.globalAlpha = 1.0
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(x, y, size * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1.0
}

const render = () => {
  if (!ctx || !landParticles) return
  ctx.clearRect(0, 0, width, height)

  // 更新波纹
  waves = waves.filter((w) => w.active)
  waves.forEach((w) => {
    w.radius += CONFIG.waveSpeed
    if (w.radius > Math.max(width, height) * 1.5) w.active = false
  })

  // 1. 物理参数预计算
  mouse.targetX += (mouse.x - width / 2 - mouse.targetX) * 0.1
  mouse.targetY += (mouse.y - height / 2 - mouse.targetY) * 0.1
  zoom.current += (zoom.target - zoom.current) * 0.1

  const finalScale = baseScale * zoom.current
  const rotY = (mouse.targetX / (width / 2)) * CONFIG.maxRotation
  const rotX = (mouse.targetY / (height / 2)) * CONFIG.maxRotation
  const cy = Math.cos(rotY),
    sy = Math.sin(rotY)
  const cx = Math.cos(rotX),
    sx = Math.sin(rotX)

  const interact = !isMobile
  const mouseRadius = Math.sqrt(CONFIG.mouseRadiusSq)
  const mouseRadiusSq = CONFIG.mouseRadiusSq
  const currentColors = isDark.value ? CONFIG.colors.dark : CONFIG.colors.light

  // 缓存布局常量
  const boundary = 10
  const landRepulsion = CONFIG.landRepulsion
  const springStiffness = CONFIG.springStiffness
  const springDamping = CONFIG.springDamping

  // Pan 计算
  const panProgress = Math.max(
    0,
    Math.min(
      1,
      (zoom.current - CONFIG.minZoom) / (CONFIG.defaultZoom - CONFIG.minZoom),
    ),
  )
  const panX = mapCenter.x * (1 - panProgress)
  const panY = mapCenter.y * (1 - panProgress)

  // 2. 绘制陆地粒子
  ctx.fillStyle = currentColors.land
  const maxCount = landParticles.length / 4
  const zoomSizeFactor = Math.min(1, Math.max(0.5, zoom.current / 2.5))

  const renderBatch = (start, end) => {
    if (start >= end) return
    ctx.globalAlpha = 1.0

    const startIdx = start * 4
    const endIdx = end * 4

    for (let i = startIdx; i < endIdx; i += 4) {
      const px = landParticles[i]
      const py = landParticles[i + 1]
      let dx = landParticles[i + 2] // 复用：X 偏移
      let dy = landParticles[i + 3] // 复用：Y 偏移

      // 基础投影 (不含交互)
      const wx = (px + panX) * finalScale
      const wy = (py + panY) * finalScale
      const x0 = wx * cy,
        z0 = wx * sy
      const y0 = wy * cx - z0 * sx,
        z_depth0 = z0 * cx + wy * sx
      const depthScale0 = CONFIG.fov / (CONFIG.fov + z_depth0)
      if (depthScale0 < 0) continue
      const projX0 = x0 * depthScale0 + halfW
      const projY0 = y0 * depthScale0 + halfH

      // 交互：目标偏移
      let targetDx = 0,
        targetDy = 0
      
      // 2.1 鼠标排斥
      if (interact) {
        const diffX = projX0 - mouse.x
        if (Math.abs(diffX) < mouseRadius) {
          const diffY = projY0 - mouse.y
          if (Math.abs(diffY) < mouseRadius) {
            const distSq = diffX * diffX + diffY * diffY
            if (distSq < mouseRadiusSq) {
              const dist = Math.sqrt(distSq)
              const force = (mouseRadius - dist) / mouseRadius
              const strength = force * landRepulsion
              targetDx += (diffX / dist) * strength
              targetDy += (diffY / dist) * strength
            }
          }
        }
      }

      // 2.2 波纹排斥
      if (waves.length > 0) {
        for (let j = 0; j < waves.length; j++) {
          const w = waves[j]
          const diffX = projX0 - w.x
          // 粗略判断
          if (Math.abs(diffX) < w.radius + CONFIG.waveWidth) {
             const diffY = projY0 - w.y
             const dist = Math.sqrt(diffX*diffX + diffY*diffY)
             const distDiff = Math.abs(dist - w.radius)
             if (distDiff < CONFIG.waveWidth) {
               const force = (1 - distDiff / CONFIG.waveWidth) * CONFIG.waveForce
               // 方向：远离波纹中心
               targetDx += (diffX / dist) * force
               targetDy += (diffY / dist) * force
             }
          }
        }
      }

      // Spring Physics for Position Shift
      dx += (targetDx - dx) * springStiffness
      dy += (targetDy - dy) * springStiffness
      dx *= springDamping
      dy *= springDamping

      landParticles[i + 2] = dx
      landParticles[i + 3] = dy

      const finalX = projX0 + dx
      const finalY = projY0 + dy
      const size = CONFIG.baseSize * depthScale0 * zoomSizeFactor

      if (
        finalX >= -boundary &&
        finalX <= width + boundary &&
        finalY >= -boundary &&
        finalY <= height + boundary
      ) {
        ctx.fillRect(finalX - size / 2, finalY - size / 2, size, size)
      }
    }
  }

  renderBatch(0, maxCount)

  // 3. 绘制城市粒子
  for (let i = 0; i < cityParticles.length; i++) {
    const p = cityParticles[i]

    const wx = (p.x + panX) * finalScale
    const wy = (p.y + panY) * finalScale
    const baseWz = p.oz || 0

    const x0 = wx * cy - baseWz * sy
    const z0 = baseWz * cy + wx * sy
    const y0 = wy * cx - z0 * sx
    const z_depth0 = z0 * cx + wy * sx
    const depthScale0 = CONFIG.fov / (CONFIG.fov + z_depth0)
    if (depthScale0 < 0) continue
    const projX0 = x0 * depthScale0 + halfW
    const projY0 = y0 * depthScale0 + halfH

    // 交互：城市保留放大效果
    let targetScale = 0
    if (interact) {
      const diffX = projX0 - mouse.x
      if (Math.abs(diffX) < mouseRadius) {
        const diffY = projY0 - mouse.y
        if (Math.abs(diffY) < mouseRadius) {
          const distSq = diffX * diffX + diffY * diffY
          if (distSq < mouseRadiusSq) {
            const dist = Math.sqrt(distSq)
            targetScale = (1 - dist / mouseRadius) * CONFIG.cityMagnify
          }
        }
      }
    }

    p.currentScale += (targetScale - p.currentScale) * springStiffness
    p.velocityScale =
      (p.velocityScale + (targetScale - p.currentScale) * springStiffness) *
      springDamping
    p.currentScale += p.velocityScale

    const effectiveSize =
      CONFIG.citySize * (1 + Math.max(0, p.currentScale)) * depthScale0
    drawCityParticle(projX0, projY0, effectiveSize, currentColors.city)
  }

  animationId = requestAnimationFrame(render)
}

// 点击事件
const onClick = (e) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  waves.push({
    x,
    y,
    radius: 0,
    active: true,
  })
}

// 窗口尺寸调整
let resizeTimer = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!canvasRef.value) return
    const parent = canvasRef.value.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()

    width = rect.width
    height = rect.height
    halfW = width / 2
    halfH = height / 2

    canvasRef.value.width = width * dpr
    canvasRef.value.height = height * dpr

    ctx = canvasRef.value.getContext('2d')
    ctx.scale(dpr, dpr)

    baseScale = Math.min(width / 800, height / 400) * CONFIG.initialScale

    const newIsMobile = window.innerWidth < 768
    // 强制重新初始化条件：模式切换或尚未初始化
    if (
      newIsMobile !== isMobile ||
      !landParticles ||
      landParticles.length === 0
    ) {
      initParticles()
    }

    if (animationId) cancelAnimationFrame(animationId)
    render()
  }, 200)
}

// 事件监听
const onMouseMove = (e) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

const onTouchStart = (e) => {
  if (e.touches.length === 1) onMouseMove(e.touches[0])
  else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    touch.lastDist = Math.sqrt(dx * dx + dy * dy)
  }
}

const onTouchMove = (e) => {
  e.preventDefault()
  if (e.touches.length === 1) onMouseMove(e.touches[0])
  else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (touch.lastDist > 0) {
      zoom.target = Math.max(
        CONFIG.minZoom,
        Math.min(CONFIG.maxZoom, zoom.target + (dist - touch.lastDist) * 0.005),
      )
    }
    touch.lastDist = dist
  }
}

const onWheel = (e) => {
  e.preventDefault()
  zoom.target = Math.max(
    CONFIG.minZoom,
    Math.min(CONFIG.maxZoom, zoom.target - e.deltaY * 0.001),
  )
}

const updateTheme = (e) => {
  isDark.value = e.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches
  mediaQuery.addEventListener('change', updateTheme)

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', onMouseMove)

  if (canvasRef.value) {
    canvasRef.value.addEventListener('click', onClick) // 绑定点击
    canvasRef.value.addEventListener('touchstart', onTouchStart, {
      passive: false,
    })
    canvasRef.value.addEventListener('touchmove', onTouchMove, {
      passive: false,
    })
    canvasRef.value.addEventListener('wheel', onWheel, { passive: false })
  }

  handleResize()
  render()
})

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', updateTheme)
  }
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', onMouseMove)

  if (canvasRef.value) {
    canvasRef.value.removeEventListener('click', onClick)
  }

  // 显式清理大对象
  landParticles = null
  cachedPixelData = null
  ctx = null
  waves = []
})
</script>
