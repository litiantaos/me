<template>
  <UiLayout
    :title="isEditMode ? '编辑已看' : '新看'"
    :isLoading="isSearching || isFetching"
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
            class="flex items-center gap-2 rounded-md border border-zinc-200 p-2 transition-colors dark:border-zinc-600"
            :class="
              selectedMovie
                ? 'cursor-default bg-zinc-50 dark:bg-zinc-700/30'
                : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/30'
            "
            @click="selectMovie(item)"
          >
            <div
              class="h-24 w-16 flex-none overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-700"
            >
              <img
                v-if="item.poster_path"
                :src="`/api/tmdb/img/w154${item.poster_path}`"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="space-y-2 text-xs">
              <NuxtLink
                :to="`/movie/${item.media_type[0] + item.id}`"
                class="block w-fit text-sm font-bold hover:text-blue-500 dark:hover:text-blue-400"
                @click.stop
              >
                {{ item.title || item.name }}
              </NuxtLink>
              <div class="text-zinc-500 dark:text-zinc-400">
                {{ item.release_date || item.first_air_date }}
              </div>
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
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            观看日期
          </label>
          <input
            v-model="movieData.watch_date"
            type="text"
            placeholder="YYYY-MM-DD"
            maxlength="10"
            class="input-base w-full"
            @input="handleDateInput"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            观看渠道
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(item, key) in movieChannelMap"
              :key="key"
              class="flex items-center justify-center gap-2 rounded-md bg-zinc-100 py-3 text-xs transition-colors dark:bg-zinc-700"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  movieData.watch_channel === key,
              }"
              @click="movieData.watch_channel = key"
            >
              <i :class="item.icon" class="block text-sm"></i>
              <span>{{ item.text }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            评价
          </label>
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

const {
  isSearching,
  isAdding,
  searchMovies,
  addMovieRecord,
  fetchMovieRecord,
  fetchMovieDetail,
} = useMovies()

const inputRef = ref(null)
const searchQuery = ref('')
const isFetching = ref(false)
const searchResults = ref([])
const selectedMovie = ref(null)

const movieData = ref({
  watch_date: formatDate(new Date(), 'YYYY-MM-DD'),
  watch_channel: 'cinema',
  rating: 3,
})

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 编辑模式 - 获取电影
const fetchEditingMovieRecord = async () => {
  if (isEditMode.value) {
    isFetching.value = true

    const movie = await fetchMovieRecord(route.query.id)
    const movieDetail = await fetchMovieDetail(movie.tmdb_id, movie.media_type)

    selectMovie({
      ...movieDetail,
      media_type: movie.media_type,
    })

    movieData.value = {
      watch_date: movie.watch_date,
      watch_channel: movie.watch_channel,
      rating: movie.rating,
    }

    isFetching.value = false
  }
}

const handleSearch = throttle(async () => {
  if (!searchQuery.value.trim()) return

  selectedMovie.value = null
  searchResults.value = await searchMovies(searchQuery.value)
})

const selectMovie = (movie) => {
  if (selectedMovie.value) return

  selectedMovie.value = movie
  searchResults.value = [movie]
}

const handleDateInput = (e) => {
  const el = e.target
  let pos = el.selectionStart

  let v = el.value.replace(/\D/g, '')

  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4)
  if (v.length > 7) v = v.slice(0, 7) + '-' + v.slice(7)

  movieData.value.watch_date = v

  nextTick(() => {
    if ((pos === 5 && v[4] === '-') || (pos === 8 && v[7] === '-')) {
      pos++
    }
    el.setSelectionRange(pos, pos)
  })
}

const validateDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false

  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  )
}

const handleSubmit = throttle(async () => {
  if (!validateDate(movieData.value.watch_date)) {
    alert('日期无效')
    return
  }

  try {
    await addMovieRecord(
      {
        tmdb_id: selectedMovie.value.id,
        media_type: selectedMovie.value.media_type,
        title: selectedMovie.value.title || selectedMovie.value.name,
        poster_path: selectedMovie.value.poster_path,
        watch_date: movieData.value.watch_date,
        watch_channel: movieData.value.watch_channel,
        rating: movieData.value.rating,
      },
      route.query.id || null,
    )

    router.push(
      `/movie/${selectedMovie.value.media_type[0] + selectedMovie.value.id}`,
    )
  } catch (error) {
    console.error('添加电影失败', error)
  }
})

onMounted(() => {
  if (isEditMode.value) {
    fetchEditingMovieRecord()
  }

  inputRef.value?.focus()
})

useSeoMeta({
  title: () => (isEditMode.value ? '编辑已看' : '新看'),
})
</script>
