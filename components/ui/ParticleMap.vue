<template>
  <canvas ref="canvasRef" class="block h-full w-full touch-none"></canvas>
</template>

<script setup>
const props = defineProps({
  // 高亮点数据，包含 latitude 和 longitude 属性
  data: {
    type: Array,
    default: () => [],
  },
})

// 配置项
const CONFIG = {
  particleGap: 2, // 桌面端粒子间隔（像素），值越小粒子越密集
  mobileGap: 5, // 移动端粒子间隔
  fov: 800, // 视场深度，影响3D透视效果
  baseSize: 2, // 基础粒子大小
  highlightSize: 16, // 高亮点标记大小
  mouseRadius: 90, // 鼠标交互影响范围（像素）
  maxRotation: 0.5, // 地图随鼠标移动的最大旋转角度（弧度）
  minZoom: 0.8, // 最小缩放比例
  maxZoom: 12, // 最大缩放比例
  initialScale: 1.2, // 初始缩放比例
  defaultZoom: 3.2, // 默认缩放层级
  centerLat: 35, // 初始中心纬度
  centerLon: 105, // 初始中心经度
  colors: {
    // 亮色/暗色模式配色方案
    light: { land: '#334155', highlight: '#fbbf24' },
    dark: { land: '#a1a1aa', highlight: '#fbbf24' },
  },
  projectionOffset: { lat: 5, lon: -1 }, // 投影偏移修正，用于校准地图中心
  highlightMagnify: 2, // 鼠标悬停时高亮点的放大倍数
  landRepulsion: 15, // 鼠标对陆地粒子的排斥力度
  springStiffness: 0.1, // 弹簧系统的劲度系数（回弹速度）
  springDamping: 0.8, // 弹簧系统的阻尼系数（回弹平滑度）
  waveSpeed: 15, // 点击波纹扩散速度
  waveWidth: 60, // 波纹宽度
  waveForce: 40, // 波纹对粒子的推力
}

const SHADERS = {
  vertex: `
    attribute vec2 a_position;
    attribute float a_size;
    uniform vec2 u_resolution;
    uniform float u_point_scale;
    varying float v_size;
    void main() {
      vec2 zeroToTwo = (a_position / u_resolution) * 2.0;
      gl_Position = vec4((zeroToTwo - 1.0) * vec2(1, -1), 0, 1);
      gl_PointSize = a_size * u_point_scale;
      v_size = a_size;
    }
  `,
  fragment: `
    precision mediump float;
    uniform vec3 u_color;
    uniform float u_opacity;
    varying float v_size;
    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      float alpha = 0.0;
      if (v_size < 8.0) {
        alpha = 1.0 - step(0.5, dist);
      } else {
        float core = 1.0 - step(0.25, dist);
        float ring = 0.3 * (1.0 - step(0.5, dist));
        alpha = max(core, ring);
      }
      if (alpha < 0.01) discard;
      float finalAlpha = alpha * u_opacity;
      gl_FragColor = vec4(u_color * finalAlpha, finalAlpha);
    }
  `,
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const createProgram = (gl, vsSrc, fsSrc) => {
  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc))
  gl.linkProgram(prog)
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null
}

const project = (lat, lon) => ({
  x: (lon + CONFIG.projectionOffset.lon + 180) * (800 / 360) - 400,
  y: (90 - (lat + CONFIG.projectionOffset.lat)) * (400 / 180) - 200,
})

// 状态管理
const canvasRef = ref(null)
const isDark = ref(false)
const engine = {
  gl: null,
  program: null,
  locs: {},
  bufs: {},
  land: { physics: null, render: null, count: 0 }, // render 现在仅包含 [x, y]
  highlight: { physics: [], render: null, count: 0 }, // render 包含 [x, y, size]
  width: 0,
  height: 0,
  halfW: 0,
  halfH: 0,
  rect: { left: 0, top: 0 },
  dpr: 1,
  center: { x: 0, y: 0 },
  colors: { land: [0, 0, 0], highlight: [0, 0, 0] },
  waves: [],
  animId: null,
  isMobile: false,
}

const interact = {
  mouse: { x: 0, y: 0, tx: 0, ty: 0 },
  zoom: { val: CONFIG.defaultZoom, target: CONFIG.defaultZoom },
  touch: { lastDist: 0 },
  baseScale: 1,
}

// 资源加载
let cachedPixels = null
const loadPixelData = async () => {
  if (cachedPixels) return cachedPixels
  return new Promise((resolve) => {
    const img = new Image()
    img.src = '/images/world.svg'
    img.onload = () => {
      const cvs = document.createElement('canvas')
      cvs.width = 800
      cvs.height = 400
      const ctx = cvs.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 800, 400)
      ctx.drawImage(img, 0, 0, 800, 400)
      resolve((cachedPixels = ctx.getImageData(0, 0, 800, 400).data))
    }
  })
}

const initWebGL = () => {
  if (!canvasRef.value || engine.gl) return !!engine.gl
  const gl = canvasRef.value.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  })
  if (!gl) return false

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  canvasRef.value.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    cancelAnimationFrame(engine.animId)
    engine.gl = null
  })
  canvasRef.value.addEventListener('webglcontextrestored', () => {
    if (initWebGL()) {
      updateColors()
      initParticles()
    }
  })

  const prog = createProgram(gl, SHADERS.vertex, SHADERS.fragment)
  if (!prog) return false

  gl.useProgram(prog)
  engine.gl = gl
  engine.program = prog
  engine.locs = {
    pos: gl.getAttribLocation(prog, 'a_position'),
    size: gl.getAttribLocation(prog, 'a_size'),
    res: gl.getUniformLocation(prog, 'u_resolution'),
    color: gl.getUniformLocation(prog, 'u_color'),
    scale: gl.getUniformLocation(prog, 'u_point_scale'),
    opacity: gl.getUniformLocation(prog, 'u_opacity'),
  }
  return true
}

const initParticles = async () => {
  try {
    const data = await loadPixelData()
    engine.isMobile = window.innerWidth < 768
    const gap = engine.isMobile ? CONFIG.mobileGap : CONFIG.particleGap
    engine.center = project(CONFIG.centerLat, CONFIG.centerLon)

    const coords = []
    for (let y = 0; y < 400; y += gap) {
      for (let x = 0; x < 800; x += gap) {
        if (data[(y * 800 + x) * 4] < 240) {
          coords.push(x - 400 - engine.center.x, y - 200 - engine.center.y)
        }
      }
    }

    const count = coords.length / 2
    engine.land.count = count
    engine.land.physics = new Float32Array(count * 4) // [bx, by, dx, dy]
    engine.land.render = new Float32Array(count * 2) // [x, y] - 优化: 不包含大小

    for (let i = 0; i < count; i++) {
      engine.land.physics[i * 4] = coords[i * 2]
      engine.land.physics[i * 4 + 1] = coords[i * 2 + 1]
    }

    if (engine.bufs.land) engine.gl.deleteBuffer(engine.bufs.land)
    engine.bufs.land = engine.gl.createBuffer()
    // 初始数据上传，之后每帧更新
    engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, engine.bufs.land)
    engine.gl.bufferData(
      engine.gl.ARRAY_BUFFER,
      engine.land.render.byteLength, // 仅分配大小
      engine.gl.DYNAMIC_DRAW,
    )

    updateHighlights()
    if (!engine.animId) render()
  } catch (e) {
    console.error(e)
  }
}

const updateHighlights = () => {
  if (!engine.center || !props.data) return
  engine.highlight.physics = props.data.map((c) => {
    const { x, y } = project(c.latitude, c.longitude)
    return {
      bx: x - engine.center.x,
      by: y - engine.center.y,
      scale: 0,
      vel: 0,
    }
  })

  const count = engine.highlight.physics.length
  engine.highlight.count = count
  engine.highlight.render = new Float32Array(count * 3) // [x, y, size]

  if (engine.bufs.highlight) engine.gl.deleteBuffer(engine.bufs.highlight)
  engine.bufs.highlight = engine.gl.createBuffer()
  engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, engine.bufs.highlight)
  engine.gl.bufferData(
    engine.gl.ARRAY_BUFFER,
    engine.highlight.render.byteLength,
    engine.gl.DYNAMIC_DRAW,
  )
}

const updateColors = () => {
  const t = isDark.value ? CONFIG.colors.dark : CONFIG.colors.light
  engine.colors.land = hexToRgb(t.land)
  engine.colors.highlight = hexToRgb(t.highlight)
}

const render = () => {
  if (!engine.gl || !engine.land.physics) return

  const { width, height, halfW, halfH, dpr, gl, locs, bufs } = engine
  const { mouse, zoom, baseScale } = interact
  const cfg = CONFIG

  // 1. 更新物理状态
  for (let i = engine.waves.length - 1; i >= 0; i--) {
    engine.waves[i].radius += cfg.waveSpeed
    if (engine.waves[i].radius > Math.max(width, height) * 1.5)
      engine.waves.splice(i, 1)
  }

  mouse.tx += (mouse.x - width / 2 - mouse.tx) * 0.1
  mouse.ty += (mouse.y - height / 2 - mouse.ty) * 0.1
  zoom.val += (zoom.target - zoom.val) * 0.1

  // 预计算变换矩阵
  const finalScale = baseScale * zoom.val
  const rotY = (mouse.tx / halfW) * cfg.maxRotation
  const rotX = (mouse.ty / halfH) * cfg.maxRotation
  const cy = Math.cos(rotY),
    sy = Math.sin(rotY)
  const cx = Math.cos(rotX),
    sx = Math.sin(rotX)

  const panP = Math.max(
    0,
    Math.min(1, (zoom.val - cfg.minZoom) / (cfg.defaultZoom - cfg.minZoom)),
  )
  const panX = engine.center.x * (1 - panP)
  const panY = engine.center.y * (1 - panP)
  const mouseRad = cfg.mouseRadius
  const interactActive = !engine.isMobile

  // 2. 陆地计算
  const count = engine.land.count
  const phy = engine.land.physics
  const ren = engine.land.render
  // ren 现在是紧密排列的 [x, y]，索引步长为 2

  for (let i = 0; i < count; i++) {
    const i4 = i * 4
    const i2 = i * 2 // 优化索引
    let dx = phy[i4 + 2],
      dy = phy[i4 + 3]

    // 投影
    const wx = (phy[i4] + panX) * finalScale
    const wy = (phy[i4 + 1] + panY) * finalScale

    // 3D 旋转
    const z0 = wx * sy
    const x0 = wx * cy
    const y0 = wy * cx - z0 * sx
    const depth = z0 * cx + wy * sx
    const scale = cfg.fov / (cfg.fov + depth)

    if (scale > 0) {
      const px = x0 * scale + halfW
      const py = y0 * scale + halfH
      let tdx = 0,
        tdy = 0

      // 交互
      if (interactActive) {
        const dxM = px - mouse.x
        if (Math.abs(dxM) < mouseRad) {
          const dyM = py - mouse.y
          if (Math.abs(dyM) < mouseRad) {
            const dist = Math.sqrt(dxM * dxM + dyM * dyM)
            if (dist < mouseRad) {
              const f = ((mouseRad - dist) / mouseRad) * cfg.landRepulsion
              tdx += (dxM / dist) * f
              tdy += (dyM / dist) * f
            }
          }
        }
      }

      // 波纹
      for (let w = 0; w < engine.waves.length; w++) {
        const wv = engine.waves[w]
        const dxW = px - wv.x
        if (Math.abs(dxW) < wv.radius + cfg.waveWidth) {
          const dyW = py - wv.y
          const dW = Math.sqrt(dxW * dxW + dyW * dyW)
          const diff = Math.abs(dW - wv.radius)
          if (diff < cfg.waveWidth) {
            const f = (1 - diff / cfg.waveWidth) * cfg.waveForce
            tdx += (dxW / dW) * f
            tdy += (dyW / dW) * f
          }
        }
      }

      dx += (tdx - dx) * cfg.springStiffness
      dy += (tdy - dy) * cfg.springStiffness
      phy[i4 + 2] = dx * cfg.springDamping
      phy[i4 + 3] = dy * cfg.springDamping

      ren[i2] = px + dx
      ren[i2 + 1] = py + dy
    } else {
      ren[i2] = -9999 // 裁剪
      ren[i2 + 1] = -9999
    }
  }

  // 3. 高亮点计算
  const cCount = engine.highlight.count
  const cPhy = engine.highlight.physics
  const cRen = engine.highlight.render

  for (let i = 0; i < cCount; i++) {
    const p = cPhy[i]
    const i3 = i * 3

    const wx = (p.bx + panX) * finalScale
    const wy = (p.by + panY) * finalScale
    const wz = -20

    const z0 = wz * cy + wx * sy
    const x0 = wx * cy - wz * sy
    const y0 = wy * cx - z0 * sx
    const depth = z0 * cx + wy * sx
    const scale = cfg.fov / (cfg.fov + depth)

    if (scale > 0) {
      const px = x0 * scale + halfW
      const py = y0 * scale + halfH
      let tScale = 0

      if (interactActive) {
        const dx = px - mouse.x
        if (Math.abs(dx) < mouseRad) {
          const dy = py - mouse.y
          const distSq = dx * dx + dy * dy
          if (Math.abs(dy) < mouseRad && distSq < mouseRad * mouseRad) {
            tScale = (1 - Math.sqrt(distSq) / mouseRad) * cfg.highlightMagnify
          }
        }
      }

      p.scale += (tScale - p.scale) * cfg.springStiffness
      p.vel =
        (p.vel + (tScale - p.scale) * cfg.springStiffness) * cfg.springDamping
      p.scale += p.vel

      cRen[i3] = px
      cRen[i3 + 1] = py
      cRen[i3 + 2] = cfg.highlightSize * (1 + Math.max(0, p.scale)) * dpr
    } else {
      cRen[i3 + 2] = 0
    }
  }

  // 4. 绘制
  gl.viewport(0, 0, width * dpr, height * dpr)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform2f(locs.res, width, height)
  gl.uniform1f(locs.scale, 0.6 + 0.4 * panP)
  gl.uniform1f(locs.opacity, 0.6 + 0.4 * panP)

  // 绘制陆地 (优化: 大小是统一常量)
  gl.enableVertexAttribArray(locs.pos)
  gl.disableVertexAttribArray(locs.size) // 关键优化
  gl.vertexAttrib1f(locs.size, cfg.baseSize * dpr)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufs.land)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, ren)
  gl.vertexAttribPointer(locs.pos, 2, gl.FLOAT, false, 0, 0) // 紧密排列
  gl.uniform3fv(locs.color, engine.colors.land)
  gl.drawArrays(gl.POINTS, 0, count)

  // 绘制高亮点 (动态大小)
  if (cCount > 0) {
    gl.enableVertexAttribArray(locs.size) // 为高亮点重新启用
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.highlight)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, cRen)
    gl.vertexAttribPointer(locs.pos, 2, gl.FLOAT, false, 12, 0) // 步长 12
    gl.vertexAttribPointer(locs.size, 1, gl.FLOAT, false, 12, 8) // 偏移 8
    gl.uniform3fv(locs.color, engine.colors.highlight)
    gl.drawArrays(gl.POINTS, 0, cCount)
  }

  engine.animId = requestAnimationFrame(render)
}

const handleResize = () => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const isFirstResize = engine.width === 0
  engine.width = rect.width
  engine.height = rect.height
  engine.halfW = rect.width / 2
  engine.halfH = rect.height / 2
  engine.rect = { left: rect.left, top: rect.top }
  engine.dpr = window.devicePixelRatio || 1
  canvasRef.value.width = rect.width * engine.dpr
  canvasRef.value.height = rect.height * engine.dpr

  if (isFirstResize) {
    interact.mouse.x = engine.halfW
    interact.mouse.y = engine.halfH
  }

  if (!engine.gl) {
    if (initWebGL()) {
      interact.baseScale =
        Math.min(rect.width / 800, rect.height / 400) * CONFIG.initialScale
      updateColors()
      initParticles()
    }
  } else {
    interact.baseScale =
      Math.min(rect.width / 800, rect.height / 400) * CONFIG.initialScale
    if (!engine.animId) render()
  }
}

const onMove = (e) => {
  interact.mouse.x = e.clientX - engine.rect.left
  interact.mouse.y = e.clientY - engine.rect.top
}
const onClick = (e) =>
  engine.waves.push({
    x: e.clientX - engine.rect.left,
    y: e.clientY - engine.rect.top,
    radius: 0,
  })

const handleTouch = (e, type) => {
  if (e.touches.length > 0) e.preventDefault()
  if (type === 'end') return void (interact.touch.lastDist = 0)

  const [t0, t1] = e.touches
  if (!t1) {
    interact.mouse.x = t0.clientX - engine.rect.left
    interact.mouse.y = t0.clientY - engine.rect.top
  } else {
    const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
    if (type === 'move' && interact.touch.lastDist > 0) {
      interact.zoom.target = Math.max(
        CONFIG.minZoom,
        Math.min(
          CONFIG.maxZoom,
          interact.zoom.target + (dist - interact.touch.lastDist) * 0.01,
        ),
      )
    }
    interact.touch.lastDist = dist
  }
}

let ro = null,
  mq = null,
  mqHandler = null,
  abortController = null
watch(() => props.data, updateHighlights, { deep: true })
watch(isDark, updateColors)

onMounted(() => {
  mq = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mq.matches
  mqHandler = (e) => (isDark.value = e.matches)
  mq.addEventListener('change', mqHandler)

  abortController = new AbortController()
  const signal = abortController.signal

  ro = new ResizeObserver((entries) => {
    if (entries[0]) handleResize()
  })
  if (canvasRef.value) {
    ro.observe(canvasRef.value)
    canvasRef.value.addEventListener('click', onClick, { signal })
    canvasRef.value.addEventListener('mousemove', onMove, { signal })
    canvasRef.value.addEventListener(
      'touchstart',
      (e) => handleTouch(e, 'start'),
      { signal },
    )
    canvasRef.value.addEventListener(
      'touchmove',
      (e) => handleTouch(e, 'move'),
      { passive: false, signal },
    )
    canvasRef.value.addEventListener('touchend', (e) => handleTouch(e, 'end'), {
      signal,
    })
    canvasRef.value.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        interact.zoom.target = Math.max(
          CONFIG.minZoom,
          Math.min(CONFIG.maxZoom, interact.zoom.target - e.deltaY * 0.001),
        )
      },
      { passive: false, signal },
    )
  }
})

onUnmounted(() => {
  if (mq && mqHandler) mq.removeEventListener('change', mqHandler)
  if (abortController) abortController.abort()
  if (ro) ro.disconnect()
  if (engine.animId) cancelAnimationFrame(engine.animId)
  if (engine.gl) {
    engine.gl.deleteBuffer(engine.bufs.land)
    engine.gl.deleteBuffer(engine.bufs.highlight)
    engine.gl.deleteProgram(engine.program)
  }
})
</script>
