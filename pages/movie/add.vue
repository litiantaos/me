<template>
  <UiLayout
    :title="isEditMode ? '编辑已看' : '添加已看'"
    :isLoading="isSearching || isLoading"
  >
    <div class="space-y-4">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        placeholder="最近看了什么呢？"
        class="input-base w-full"
        @keyup.enter="handleSearch"
      />

      <div v-if="searchResults.length > 0" class="space-y-2">
        <TransitionGroup name="list">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 p-2 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-700/30"
            :class="{
              'pointer-events-none bg-zinc-50 dark:bg-zinc-700/30':
                selectedMovie,
            }"
            @click="selectMovie(item)"
          >
            <div
              class="h-24 w-16 flex-none overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-700"
            >
              <img
                v-if="item.poster_path"
                :src="`https://image.tmdb.org/t/p/w300${item.poster_path}`"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="space-y-2 text-xs">
              <p class="text-sm font-bold">
                {{ item.title || item.name }}
              </p>
              <p class="text-zinc-500 dark:text-zinc-400">
                {{ item.release_date || item.first_air_date }}
              </p>
              <p class="line-clamp-2 text-zinc-500 dark:text-zinc-400">
                {{ item.overview }}
              </p>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div
        v-if="selectedMovie"
        class="space-y-6 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
      >
        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400"
            >观看日期</label
          >
          <input
            v-model="movieData.watch_date"
            type="date"
            class="input-base w-full"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400"
            >评价</label
          >
          <div class="grid grid-cols-5 gap-2 sm:gap-3">
            <button
              v-for="(item, key) in movieRatingMap"
              :key="key"
              class="group flex flex-col items-center gap-3 rounded-md bg-zinc-100 py-3 transition-colors dark:bg-zinc-700"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  movieData.rating === Number(key),
              }"
              @click="movieData.rating = Number(key)"
            >
              <img
                :src="item.gif"
                class="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-3 group-hover:scale-160"
              />
              <div class="text-xs">
                {{ item.text }}
              </div>
            </button>
          </div>
        </div>

        <button
          v-if="movieData.watch_date"
          class="btn-primary"
          @click="handleSubmit"
        >
          <UiLoader v-if="isAdding" size="md" />
          <span v-else>确认</span>
        </button>
      </div>
    </div>
  </UiLayout>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const { searchMovies, addMovie, fetchMovie, isSearching, isAdding } =
  useMovies()

const inputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const selectedMovie = ref(null)
const isLoading = ref(false)

const movieData = ref({
  watch_date: formatDate(new Date(), 'YYYY-MM-DD'),
  rating: 3,
})

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 编辑模式 - 获取电影
const fetchEditingMovie = async () => {
  if (isEditMode.value) {
    isLoading.value = true

    const movie = await fetchMovie(route.query.id)

    selectMovie(movie)

    movieData.value = {
      watch_date: movie.watch_date,
      rating: movie.rating,
    }

    isLoading.value = false
  }
}

const handleSearch = throttle(async () => {
  if (!searchQuery.value.trim()) return

  selectedMovie.value = null
  searchResults.value = await searchMovies(searchQuery.value)
})

const selectMovie = (movie) => {
  selectedMovie.value = movie
  searchResults.value = [movie]
}

const handleSubmit = throttle(async () => {
  try {
    await addMovie(
      {
        id: selectedMovie.value.id,
        media_type: selectedMovie.value.media_type,
        title: selectedMovie.value.title || selectedMovie.value.name,
        poster_path: selectedMovie.value.poster_path,
        overview: selectedMovie.value.overview,
        watch_date: movieData.value.watch_date,
        rating: movieData.value.rating,
      },
      route.query.id || null,
    )

    router.push('/movie')
  } catch (error) {
    console.error('添加电影失败', error)
  }
})

onMounted(() => {
  // 编辑模式 - 获取电影
  if (isEditMode.value) {
    fetchEditingMovie()
  }

  inputRef.value?.focus()
})

useSeoMeta({
  title: () => (isEditMode.value ? '编辑已看' : '添加已看'),
})
</script>
