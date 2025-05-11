<template>
  <p>
    <span v-if="sentenceData">{{ sentenceData.content }}</span>
    <span v-else>^_^</span>
  </p>
</template>

<script setup>
const sentenceData = ref(null)

const getShiciToken = async () => {
  try {
    const localToken = localStorage.getItem('shici_token')
    if (localToken) {
      return localToken
    }

    const response = await fetch('https://v2.jinrishici.com/token')
    const data = await response.json()

    const token = data.data
    localStorage.setItem('shici_token', token)
    return token
  } catch (error) {
    console.error('Failed to fetch shici token:', error)
  }
}

const getSentence = async () => {
  try {
    const token = await getShiciToken()

    const response = await fetch(
      `https://v2.jinrishici.com/sentence?client=npm-sdk/1.0&X-User-Token=${encodeURIComponent(token)}`,
    )
    const data = await response.json()

    // console.log(data)

    sentenceData.value = data.data
  } catch (error) {
    console.error('Failed to fetch sentence:', error)
  }
}

onMounted(() => {
  getSentence()
})
</script>
