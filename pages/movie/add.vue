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

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="space-y-2">
        <TransitionGroup name="list">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="flex items-center gap-2 rounded-md border border-zinc-200 p-2 transition-colors duration-300 dark:border-zinc-600"
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
                :to="`/movie/${item.media_type[0] + item.id}${item.media_type === 'tv' && movieRecordData.season_number !== null ? 's' + movieRecordData.season_number : ''}`"
                class="block w-fit text-sm font-bold hover:text-blue-500 dark:hover:text-blue-400"
                @click.stop
              >
                {{ item.title || item.name }}
              </NuxtLink>
              <div class="text-zinc-500 dark:text-zinc-400">
                {{ item.release_date || item.first_air_date }}
              </div>
              <p
                class="line-clamp-2 text-justify text-zinc-500 dark:text-zinc-400"
              >
                {{ item.overview }}
              </p>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- 观看选项 -->
      <div
        v-if="selectedMovie"
        class="space-y-6 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
      >
        <div v-if="selectedMovie.media_type === 'tv'" class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            观看季数
          </label>
          <div class="relative">
            <select
              v-model="movieRecordData.season_number"
              class="input-base w-full pr-8"
              @change="handleSeasonChange"
            >
              <option :value="null">全部</option>
              <option
                v-for="season in selectedMovie.seasons"
                :key="season.id"
                :value="season.season_number"
              >
                {{ season.name }}
              </option>
            </select>
            <i
              class="ri-arrow-down-s-line absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400"
            ></i>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            观看日期
          </label>
          <input
            v-model="movieRecordData.watch_date"
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
              class="flex items-center justify-center gap-2 rounded-md bg-zinc-100 py-3 text-xs transition-colors duration-300 dark:bg-zinc-700"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  movieRecordData.watch_channel === key,
              }"
              @click="movieRecordData.watch_channel = key"
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
              class="group flex flex-col items-center gap-3 rounded-md bg-zinc-100 py-3 transition-colors duration-300 dark:bg-zinc-700"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  movieRecordData.rating === Number(key),
              }"
              @click="movieRecordData.rating = Number(key)"
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
          v-if="movieRecordData.watch_date"
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
const selectedMovieDetail = ref(null)

const movieRecordData = ref({
  watch_date: formatDate(new Date(), 'YYYY-MM-DD'),
  watch_channel: 'cinema',
  rating: 3,
  season_number: null,
})

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return route.query.id ? true : false
})

// 编辑模式 - 获取电影
const fetchEditingMovieRecord = async () => {
  if (isEditMode.value) {
    isFetching.value = true

    const movieRecord = await fetchMovieRecord(route.query.id)
    selectedMovieDetail.value = await fetchMovieDetail(
      movieRecord.media_type,
      movieRecord.tmdb_id,
    )

    selectMovie({
      ...selectedMovieDetail.value,
      media_type: movieRecord.media_type,
    })

    movieRecordData.value = {
      watch_date: movieRecord.watch_date,
      watch_channel: movieRecord.watch_channel,
      rating: movieRecord.rating,
      season_number: movieRecord.season_number,
    }

    isFetching.value = false
  }
}

const handleSearch = throttle(async () => {
  if (!searchQuery.value.trim()) return

  selectedMovie.value = null
  searchResults.value = await searchMovies(searchQuery.value)
})

const selectMovie = async (movie) => {
  if (selectedMovie.value) return

  selectedMovie.value = movie
  searchResults.value = [movie]

  if (movie.media_type === 'tv' && !movie.seasons) {
    selectedMovieDetail.value = await fetchMovieDetail(
      movie.media_type,
      movie.id,
    )

    selectedMovie.value = {
      ...selectedMovieDetail.value,
      media_type: movie.media_type,
    }
  }
}

const handleSeasonChange = () => {
  selectedMovie.value = { ...selectedMovieDetail.value, media_type: 'tv' }

  if (movieRecordData.value.season_number !== null) {
    const season = selectedMovieDetail.value.seasons.find(
      (item) => item.season_number === movieRecordData.value.season_number,
    )

    selectedMovie.value.poster_path = season.poster_path
    selectedMovie.value.name =
      selectedMovieDetail.value.name + ' ' + season.name
    selectedMovie.value.first_air_date = season.air_date
    selectedMovie.value.overview =
      season.overview || selectedMovieDetail.value.overview
  }

  searchResults.value = [selectedMovie.value]
}

const handleDateInput = (e) => {
  const el = e.target
  let pos = el.selectionStart

  let v = el.value.replace(/\D/g, '')

  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4)
  if (v.length > 7) v = v.slice(0, 7) + '-' + v.slice(7)

  movieRecordData.value.watch_date = v

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
  if (!validateDate(movieRecordData.value.watch_date)) {
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
        watch_date: movieRecordData.value.watch_date,
        watch_channel: movieRecordData.value.watch_channel,
        rating: movieRecordData.value.rating,
        season_number: movieRecordData.value.season_number,
      },
      route.query.id || null,
    )

    router.push(
      `/movie/${selectedMovie.value.media_type[0] + selectedMovie.value.id + (movieRecordData.value.season_number ? 's' + movieRecordData.value.season_number : '')}`,
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
