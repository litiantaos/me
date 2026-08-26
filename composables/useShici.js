export const useShici = () => {
  const shici = useState('shici', () => null)

  const fetchShiciToken = async () => {
    try {
      const localToken = localStorage.getItem('shici_token')
      if (localToken) {
        return localToken
      }

      const response = await $fetch('https://v2.jinrishici.com/token')

      localStorage.setItem('shici_token', response.data)

      return response.data
    } catch (error) {
      console.error('获取诗词 Token 失败', error)
      // 抛出语义化错误，避免 undefined 被拼进下游 URL
      throw new Error('Token 获取失败')
    }
  }

  const fetchShici = async () => {
    try {
      const token = await fetchShiciToken()

      const response = await $fetch(
        `https://v2.jinrishici.com/sentence?client=npm-sdk/1.0&X-User-Token=${encodeURIComponent(token)}`,
      )

      shici.value = response.data
    } catch (error) {
      console.error('获取诗词失败', error)
    }
  }

  return {
    shici,
    fetchShici,
  }
}
