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

// Configuration
const CONFIG = {
  particleGap: 2,
  mobileGap: 5,
  fov: 800,
  baseSize: 2,
  citySize: 16,
  mouseRadiusSq: 8100,
  viscosity: 0.1,
  maxRotation: 0.5,
  minZoom: 0.8,
  maxZoom: 12,
  initialScale: 1.2,
  defaultZoom: 3.2,
  centerLat: 35,
  centerLon: 105,
  colors: {
    light: { land: '#334155', city: '#fbbf24' },
    dark: { land: '#a1a1aa', city: '#fbbf24' },
  },
  projectionOffset: { lat: 5, lon: -1 },
  cityMagnify: 3,
  landRepulsion: 15,
  springStiffness: 0.1,
  springDamping: 0.8,
  waveSpeed: 15,
  waveWidth: 60,
  waveForce: 40,
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
        alpha = 1.0 - smoothstep(0.45, 0.5, dist);
      } else {
        float core = smoothstep(0.25, 0.23, dist);
        float glow = 0.4 * smoothstep(0.5, 0.3, dist);
        alpha = max(core, glow);
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

const createWebGLProgram = (gl, vsSrc, fsSrc) => {
  const compile = (type, src) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
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

// State
const canvasRef = ref(null)
const isDark = ref(false)
const engine = {
  gl: null,
  program: null,
  locs: {}, // locations
  bufs: {}, // buffers
  // Data arrays
  land: { physics: null, render: null, count: 0 }, // physics: [baseX, baseY, dx, dy]
  city: { physics: [], render: null, count: 0 },
  // Runtime
  width: 0,
  height: 0,
  halfW: 0,
  halfH: 0,
  rect: { left: 0, top: 0 },
  dpr: 1,
  center: { x: 0, y: 0 },
  colors: { land: [0, 0, 0], city: [0, 0, 0] },
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

// Resources
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

  const prog = createWebGLProgram(gl, SHADERS.vertex, SHADERS.fragment)
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
    engine.land.physics = new Float32Array(count * 4)
    engine.land.render = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      engine.land.physics[i * 4] = coords[i * 2] // bx
      engine.land.physics[i * 4 + 1] = coords[i * 2 + 1] // by
      engine.land.render[i * 3 + 2] = CONFIG.baseSize * engine.dpr
    }

    if (engine.bufs.land) engine.gl.deleteBuffer(engine.bufs.land)
    engine.bufs.land = engine.gl.createBuffer()
    engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, engine.bufs.land)
    engine.gl.bufferData(
      engine.gl.ARRAY_BUFFER,
      engine.land.render,
      engine.gl.DYNAMIC_DRAW,
    )

    updateCities()
    if (!engine.animId) render()
  } catch (e) {
    console.error(e)
  }
}

const updateCities = () => {
  if (!engine.center || !props.data) return
  engine.city.physics = props.data.map((c) => {
    const { x, y } = project(c.latitude, c.longitude)
    return {
      bx: x - engine.center.x,
      by: y - engine.center.y,
      scale: 0,
      vel: 0,
    }
  })

  const count = engine.city.physics.length
  engine.city.count = count
  engine.city.render = new Float32Array(count * 3)

  if (engine.bufs.city) engine.gl.deleteBuffer(engine.bufs.city)
  engine.bufs.city = engine.gl.createBuffer()
  engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, engine.bufs.city)
  engine.gl.bufferData(
    engine.gl.ARRAY_BUFFER,
    engine.city.render,
    engine.gl.DYNAMIC_DRAW,
  )
}

const updateColors = () => {
  const t = isDark.value ? CONFIG.colors.dark : CONFIG.colors.light
  engine.colors.land = hexToRgb(t.land)
  engine.colors.city = hexToRgb(t.city)
}

const render = () => {
  if (!engine.gl || !engine.land.physics) return

  const { width, height, halfW, halfH, dpr, gl, locs, bufs } = engine
  const { mouse, zoom, baseScale } = interact
  const cfg = CONFIG
  const waveLimit = Math.max(width, height) * 1.5

  // 1. Update Interaction & Physics State
  // Wave GC
  for (let i = engine.waves.length - 1; i >= 0; i--) {
    engine.waves[i].radius += cfg.waveSpeed
    if (engine.waves[i].radius > waveLimit) engine.waves.splice(i, 1)
  }

  mouse.tx += (mouse.x - width / 2 - mouse.tx) * 0.1
  mouse.ty += (mouse.y - height / 2 - mouse.ty) * 0.1
  zoom.val += (zoom.target - zoom.val) * 0.1

  const finalScale = baseScale * zoom.val
  const rotY = (mouse.tx / (width / 2)) * cfg.maxRotation
  const rotX = (mouse.ty / (height / 2)) * cfg.maxRotation
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

  const interactActive = !engine.isMobile
  const mouseRad = Math.sqrt(cfg.mouseRadiusSq)

  // 2. Land Calculation
  const count = engine.land.count
  const phy = engine.land.physics
  const ren = engine.land.render
  const STRIDE = 12

  for (let i = 0; i < count; i++) {
    const i4 = i * 4,
      i3 = i * 3
    let dx = phy[i4 + 2],
      dy = phy[i4 + 3]

    // Projection
    const wx = (phy[i4] + panX) * finalScale
    const wy = (phy[i4 + 1] + panY) * finalScale

    // 3D Transform
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

      // Interaction
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

      // Waves
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

      ren[i3] = px + dx
      ren[i3 + 1] = py + dy
      ren[i3 + 2] = CONFIG.baseSize * dpr
    } else {
      ren[i3 + 2] = 0
    }
  }

  // 3. City Calculation
  const cCount = engine.city.count
  const cPhy = engine.city.physics
  const cRen = engine.city.render

  for (let i = 0; i < cCount; i++) {
    const p = cPhy[i]
    const i3 = i * 3

    const wx = (p.bx + panX) * finalScale
    const wy = (p.by + panY) * finalScale
    const wz = -20 // Base offset

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
          if (
            Math.abs(dy) < mouseRad &&
            dx * dx + dy * dy < cfg.mouseRadiusSq
          ) {
            tScale =
              (1 - Math.sqrt(dx * dx + dy * dy) / mouseRad) * cfg.cityMagnify
          }
        }
      }

      p.scale += (tScale - p.scale) * cfg.springStiffness
      p.vel =
        (p.vel + (tScale - p.scale) * cfg.springStiffness) * cfg.springDamping
      p.scale += p.vel

      cRen[i3] = px
      cRen[i3 + 1] = py
      cRen[i3 + 2] = cfg.citySize * (1 + Math.max(0, p.scale)) * dpr
    } else {
      cRen[i3 + 2] = 0
    }
  }

  // 4. Draw
  gl.viewport(0, 0, width * dpr, height * dpr)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform2f(locs.res, width, height)
  gl.uniform1f(locs.scale, 0.6 + 0.4 * panP)
  gl.uniform1f(locs.opacity, 0.6 + 0.4 * panP)
  gl.enableVertexAttribArray(locs.pos)
  gl.enableVertexAttribArray(locs.size)

  gl.bindBuffer(gl.ARRAY_BUFFER, bufs.land)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, ren)
  gl.vertexAttribPointer(locs.pos, 2, gl.FLOAT, false, STRIDE, 0)
  gl.vertexAttribPointer(locs.size, 1, gl.FLOAT, false, STRIDE, 8) // Offset 2*4
  gl.uniform3fv(locs.color, engine.colors.land)
  gl.drawArrays(gl.POINTS, 0, count)

  if (cCount > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.city)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, cRen)
    gl.vertexAttribPointer(locs.pos, 2, gl.FLOAT, false, STRIDE, 0)
    gl.vertexAttribPointer(locs.size, 1, gl.FLOAT, false, STRIDE, 8)
    gl.uniform3fv(locs.color, engine.colors.city)
    gl.drawArrays(gl.POINTS, 0, cCount)
  }

  engine.animId = requestAnimationFrame(render)
}

const handleResize = () => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  engine.width = rect.width
  engine.height = rect.height
  engine.halfW = rect.width / 2
  engine.halfH = rect.height / 2
  engine.rect = { left: rect.left, top: rect.top }
  engine.dpr = window.devicePixelRatio || 1
  canvasRef.value.width = rect.width * engine.dpr
  canvasRef.value.height = rect.height * engine.dpr

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

let ro = null,
  mq = null
watch(() => props.data, updateCities, { deep: true })
watch(isDark, updateColors)

onMounted(() => {
  mq = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mq.matches
  mq.addEventListener('change', (e) => (isDark.value = e.matches))

  ro = new ResizeObserver((entries) => {
    if (entries[0]) handleResize()
  })
  if (canvasRef.value) {
    ro.observe(canvasRef.value)
    canvasRef.value.addEventListener('click', onClick)
    canvasRef.value.addEventListener('mousemove', onMove)
    canvasRef.value.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        interact.zoom.target = Math.max(
          CONFIG.minZoom,
          Math.min(CONFIG.maxZoom, interact.zoom.target - e.deltaY * 0.001),
        )
      },
      { passive: false },
    )
  }
})

onUnmounted(() => {
  if (mq) mq.removeEventListener('change', () => {})
  if (ro) ro.disconnect()
  if (engine.animId) cancelAnimationFrame(engine.animId)
  if (engine.gl) {
    engine.gl.deleteBuffer(engine.bufs.land)
    engine.gl.deleteBuffer(engine.bufs.city)
    engine.gl.deleteProgram(engine.program)
  }
})
</script>
