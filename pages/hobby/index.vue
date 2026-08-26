<template>
  <UiLayout title="爱好" :isLoading="isFetching">
    <div class="space-y-10">
      <div class="flex items-center gap-6">
        <NuxtLink
          v-if="user && user?.app_metadata?.role === 'admin'"
          to="/hobby/add"
          class="link-base ri-add-large-line"
        ></NuxtLink>

        <div class="link-base flex items-center">
          <button
            class="ri-search-line active:opacity-100!"
            aria-label="搜索"
            @click="handleSearchExpand"
          ></button>
          <input
            type="text"
            ref="searchInputRef"
            v-model="searchQuery"
            :class="[
              isSearchExpand ? 'w-40 px-2' : 'w-0',
              'font-normal! text-zinc-600 transition-all duration-300 dark:text-zinc-200',
            ]"
            @blur="!searchQuery && (isSearchExpand = false)"
            @keydown.enter="handleSearch"
          />
          <button
            v-if="isSearchExpand"
            class="ri-close-line text-zinc-400"
            @click="handleSearchReset"
          ></button>
        </div>

        <div class="flex-1"></div>

        <UiTabs
          v-model="activeTab"
          :tabs="[
            { label: '影视', value: 'video', icon: 'ri-youtube-fill' },
            { label: '游戏', value: 'game', icon: 'ri-gamepad-fill' },
          ]"
        />
      </div>

      <div v-if="hobbies.length > 0" class="space-y-10">
        <div
          v-for="group in hobbiesByMonth"
          :key="group.month"
          class="space-y-4"
        >
          <h2 class="font-semibold text-zinc-500 dark:text-zinc-400">
            {{ group.month }}
          </h2>
          <div
            class="grid grid-cols-3 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4"
          >
            <NuxtLink
              v-for="hobby in group.list"
              :key="hobby.id"
              :to="`/hobby/${hobby.type}/${hobby.hobby_id}`"
              class="relative block space-y-2"
            >
              <div
                class="aspect-2/3 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
              >
                <img
                  v-if="hobby.poster"
                  :src="
                    hobby.type === 'game'
                      ? hobby.poster
                      : `/api/tmdb/img/w342${hobby.poster}`
                  "
                  class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div class="space-y-1">
                <h3 class="truncate font-medium">
                  {{ hobby.title }}
                </h3>
                <div
                  v-if="hobby.rating"
                  class="flex items-center gap-1 text-xs"
                >
                  <i
                    class="block text-sm text-zinc-400"
                    :class="hobbyChannelMap[hobby.type][hobby.channel]?.icon"
                  ></i>
                  <div :class="hobbyRatingMap[hobby.rating]?.color">
                    {{ hobbyRatingMap[hobby.rating]?.text }}
                  </div>
                  <img
                    :src="hobbyRatingMap[hobby.rating]?.gif"
                    class="h-4 w-4"
                  />
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </UiLayout>
</template>
<script setup>
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const { isFetching, hobbies, fetchHobbyRecords } = useHobby()

const activeTab = ref(route.query.tab === 'game' ? 'game' : 'video')

// 搜索
const isSearchExpand = ref(false)
const searchInputRef = ref(null)
const searchQuery = ref('')
const filterQuery = ref('')

const handleSearchExpand = () => {
  isSearchExpand.value = true

  if (isSearchExpand.value) {
    setTimeout(() => {
      searchInputRef.value.focus()
    }, 200)
  }
}

const handleSearchReset = () => {
  isSearchExpand.value = false
  searchQuery.value = ''
  filterQuery.value = ''
}

const handleSearch = (e) => {
  if (e.isComposing) return
  filterQuery.value = searchQuery.value.trim()
}

// 按月份分组
const hobbiesByMonth = computed(() => {
  if (!hobbies.value) return []

  const groups = {}

  let filteredHobbies = filterQuery.value
    ? hobbies.value.filter((hobby) =>
        hobby.title?.toLowerCase().includes(filterQuery.value.toLowerCase()),
      )
    : hobbies.value

  // 根据 Tab 过滤类型
  if (activeTab.value === 'video') {
    filteredHobbies = filteredHobbies.filter((h) =>
      ['movie', 'tv'].includes(h.type),
    )
  } else if (activeTab.value === 'game') {
    filteredHobbies = filteredHobbies.filter((h) => h.type === 'game')
  }

  filteredHobbies.forEach((hobby) => {
    const month = hobby.date ? hobby.date.substring(0, 7) : '时间之外'

    if (!groups[month]) {
      groups[month] = []
    }

    groups[month].push(hobby)
  })

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((month) => ({
      month,
      list: groups[month].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
})

watch(activeTab, (newTab) => {
  if (route.query.tab !== newTab) {
    router.replace({ query: { ...route.query, tab: newTab } })
  }
})

onMounted(async () => {
  if (hobbies.value.length === 0) {
    fetchHobbyRecords()
  }
})

useSeoMeta({
  title: '爱好',
  description: '记录看过的电影与剧集、玩过的游戏等。',
})
</script>
