import { escapeAttrText, isSafeMediaSrc } from './md.js'

// 获取图片尺寸
export const getImageDimensions = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// 获取视频尺寸
export const getVideoDimensions = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () =>
      resolve({ width: video.videoWidth, height: video.videoHeight })
    video.onerror = () => resolve(null)
    video.src = src
  })
}

// 处理内容中的媒体尺寸
export const processContentWithDimensions = async (content) => {
  let processed = content
  const dimensionCache = new Map()

  const getDims = async (src, type) => {
    if (dimensionCache.has(src)) return dimensionCache.get(src)
    const fn = type === 'video' ? getVideoDimensions : getImageDimensions
    const dims = await fn(src)
    if (dims) dimensionCache.set(src, dims)
    return dims
  }

  // Markdown 图片: ![alt](url) -> <img ...>
  for (const match of [...processed.matchAll(/!\[(.*?)\]\((.*?)\)/g)]) {
    const [fullMatch, alt, urlRaw] = match
    const src = urlRaw.split(' ')[0]
    if (!src) continue
    // 非法协议直接丢弃该图
    if (!isSafeMediaSrc(src, true)) continue

    const dims = await getDims(src, 'image')
    if (dims) {
      const imgTag = `<img src="${escapeAttrText(src)}" alt="${escapeAttrText(alt)}" width="${dims.width}" height="${dims.height}" loading="lazy" />`
      processed = processed.split(fullMatch).join(imgTag)
    }
  }

  // HTML 标签处理 (img & video)
  const processTags = async (regex, type) => {
    for (const match of [...processed.matchAll(regex)]) {
      const [fullTag, src] = match
      if (fullTag.includes('width=') && fullTag.includes('height=')) continue

      const dims = await getDims(src, type)
      if (dims) {
        const attr = `width="${dims.width}" height="${dims.height}"`
        const newTag = fullTag.replace(/\s*(\/?>)$/, ` ${attr} $1`)
        processed = processed.split(fullTag).join(newTag)
      }
    }
  }

  await processTags(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, 'image')
  await processTags(/<video\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, 'video')

  return processed
}
