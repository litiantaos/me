<template>
  <UiLayout title="足迹" :isFullPage="true" :isLoading="isLoading">
    <UiParticleMap :data="cities" />

    <div
      v-if="user && user?.app_metadata?.role === 'admin'"
      class="fixed top-24 left-0 w-full space-y-3 px-4 sm:w-60"
    >
      <input
        v-model="input"
        @keyup.enter="handleSearch"
        placeholder="搜索城市"
        class="input-base w-full bg-white/90! dark:bg-zinc-800/90!"
        :disabled="isLoading"
      />

      <UiMessage v-if="errorMsg" :text="errorMsg" />

      <!-- 搜索结果 -->
      <div
        v-if="searchResults.length > 0"
        class="overflow-hidden rounded-md border border-zinc-200 bg-white/90 dark:border-zinc-700 dark:bg-zinc-800/90"
      >
        <button
          v-for="feature in searchResults"
          :key="feature.id"
          @click="handleSelect(feature)"
          class="w-full px-3 py-2 text-left hover:bg-zinc-100/90 dark:hover:bg-zinc-700/90"
        >
          <div class="font-medium">
            {{ feature.properties.name }}
          </div>
          <div class="text-xs text-zinc-500">
            {{
              feature.properties.place_formatted ||
              feature.properties.full_address
            }}
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="cities.length > 0"
      class="fixed bottom-8 left-0 flex w-full flex-col items-center space-y-3 px-4 sm:bottom-20"
    >
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold">{{ countries.size }}</span>
        <span>个国家</span>

        <span class="text-2xl font-bold">{{ cities.length }}</span>
        <span>个城市</span>
      </div>

      <UiScrollView customClass="gap-3">
        <div
          v-for="city in cities"
          :key="city.id"
          class="flex-none first:ml-auto last:mr-auto"
        >
          {{ city.city.replace('市', '') }}
        </div>
      </UiScrollView>
    </div>
  </UiLayout>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const config = useRuntimeConfig()

const input = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const cities = ref([])
const searchResults = ref([])

const countries = computed(() => {
  const countries = new Set()
  cities.value.forEach((c) => {
    if (c.country) countries.add(c.country)
  })
  return countries
})

watch(
  () => input.value,
  () => {
    if (!input.value) {
      searchResults.value = []
    }
  },
)

// 获取所有城市
const fetchPlaces = async () => {
  const { data, error } = await client
    .from('places')
    .select('*')
    .order('priority')

  if (error) {
    console.error('Error fetching places:', error)
    return
  }

  if (data) {
    cities.value = data
  }
}

// 搜索城市
const handleSearch = async () => {
  if (!input.value.trim()) return

  isLoading.value = true
  errorMsg.value = ''
  searchResults.value = []

  try {
    const data = await $fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${input.value}&types=place&limit=5&access_token=${config.public.mapboxToken}`,
    )

    console.log(data)
    // return

    if (data.features?.length === 0) {
      errorMsg.value = '未找到该城市'
      return
    }

    searchResults.value = data.features
  } catch (error) {
    console.error('Error:', error)
    errorMsg.value = error.message || '搜索失败'
  } finally {
    isLoading.value = false
  }
}

// 选择并保存城市
const handleSelect = async (feature) => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    const properties = feature.properties
    const { longitude, latitude } = properties.coordinates
    const city = properties.name
    const country = properties.context.country.name

    const { error } = await client.from('places').insert({
      city,
      latitude,
      longitude,
      country,
      user_id: user.value.sub,
    })

    if (error) throw error

    input.value = ''
    searchResults.value = []
    await fetchPlaces()
  } catch (error) {
    console.error('Error saving place:', error)
    errorMsg.value = error.message || '保存失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPlaces()
})
</script>
