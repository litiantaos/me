<template>
  <UiLayout title="已看" :isLoading="isFetching">
    <div class="space-y-10">
      <div class="flex gap-6">
        <NuxtLink
          v-if="user && user?.app_metadata?.role === 'admin'"
          to="/movie/add"
          class="link-color"
        >
          Add
        </NuxtLink>
        <div class="link-color flex items-center">
          <button class="ri-search-line" @click="handleSearchExpand"></button>
          <input
            type="text"
            ref="searchInputRef"
            v-model="searchText"
            :class="[
              isSearchExpand ? 'w-40 px-2' : 'w-0',
              'font-normal! text-zinc-600 transition-all duration-300 dark:text-zinc-200',
            ]"
            @blur="!searchText && (isSearchExpand = false)"
            @keydown.enter="filterText = searchText"
          />
          <button
            v-if="isSearchExpand"
            class="ri-close-line text-zinc-400"
            @click="handleSearchReset"
          ></button>
        </div>
      </div>

      <div v-if="movies.length > 0" class="space-y-10">
        <div
          v-for="group in moviesByMonth"
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
              v-for="movie in group.list"
              :key="movie.id"
              :to="`/movie/${movie.media_type[0] + movie.tmdb_id + (movie.season_number ? 's' + movie.season_number : '')}`"
              class="relative block space-y-2"
            >
              <div
                class="aspect-2/3 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
              >
                <img
                  v-if="movie.poster_path"
                  :src="`/api/tmdb/img/w342${movie.poster_path}`"
                  class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div class="space-y-1">
                <h3 class="truncate font-medium">
                  {{ movie.title }}
                  <span v-if="movie.season_number">
                    S{{ movie.season_number }}
                  </span>
                </h3>
                <div
                  v-if="movie.rating"
                  class="flex items-center gap-1 text-xs"
                >
                  <i
                    class="block text-sm text-zinc-400"
                    :class="movieChannelMap[movie.watch_channel]?.icon"
                  ></i>
                  <div :class="movieRatingMap[movie.rating].color">
                    {{ movieRatingMap[movie.rating].text }}
                  </div>
                  <img
                    :src="movieRatingMap[movie.rating].gif"
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

const { isFetching, movies, fetchMovieRecords } = useMovies()

// 搜索
const isSearchExpand = ref(false)
const searchInputRef = ref(null)
const searchText = ref('')
const filterText = ref('')

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
  searchText.value = ''
  filterText.value = ''
}

// 按月份分组电影
const moviesByMonth = computed(() => {
  if (!movies.value) return []

  const groups = {}

  const filteredMovies = filterText.value
    ? movies.value.filter((movie) =>
        movie.title?.toLowerCase().includes(filterText.value.toLowerCase()),
      )
    : movies.value

  filteredMovies.forEach((movie) => {
    const month = movie.watch_date
      ? movie.watch_date.substring(0, 7)
      : '未知时间'

    if (!groups[month]) {
      groups[month] = []
    }

    groups[month].push(movie)
  })

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((month) => ({
      month,
      list: groups[month].sort(
        (a, b) => new Date(b.watch_date) - new Date(a.watch_date),
      ),
    }))
})

onMounted(async () => {
  if (movies.value.length === 0) {
    fetchMovieRecords()
  }
})

useSeoMeta({
  title: '已看影视',
})
</script>
