export const useShici = () => {
  const shici = useState('shici', () => null)

  const fetchShiciToken = async () => {
    try {
      const localToken = localStorage.getItem('shici_token')
      if (localToken) {
        return localToken
      }

      const data = await $fetch('https://v2.jinrishici.com/token')

      const token = data.data
      localStorage.setItem('shici_token', token)
      return token
    } catch (error) {
      console.error('获取诗词 Token 失败', error)
    }
  }

  const fetchShici = async () => {
    try {
      const token = await fetchShiciToken()

      const data = await $fetch(
        `https://v2.jinrishici.com/sentence?client=npm-sdk/1.0&X-User-Token=${encodeURIComponent(token)}`,
      )

      shici.value = data.data
    } catch (error) {
      console.error('获取诗词失败', error)
    }
  }

  return {
    shici,
    fetchShici,
  }
}
