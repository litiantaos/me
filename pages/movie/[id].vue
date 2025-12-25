<template>
  <UiLayout :isLoading="isLoading">
    <div v-if="movie" class="space-y-6">
      <!-- 影视详情 -->
      <div class="flex flex-col gap-6 sm:flex-row">
        <div
          class="h-72 w-48 flex-none overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
        >
          <img
            v-if="movie.poster_path"
            :src="`/api/tmdb/img/w342${movie.poster_path}`"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="flex flex-1 flex-col gap-4 overflow-hidden sm:h-72">
          <h2 class="text-2xl font-bold">
            <span>{{ movie.title || movie.name }}</span>
            <span v-if="movie.original_language !== 'zh'" class="text-zinc-400">
              （{{ movie.original_title || movie.original_name }}）
            </span>
          </h2>

          <div class="flex items-center font-medium">
            <div>
              <span>
                {{ movie.release_date ? 'Movie' : 'TV' }}
              </span>
            </div>

            <div>
              <span class="mx-3 text-zinc-300">｜</span>
              <span>
                {{
                  formatDate(movie.release_date || movie.first_air_date, 'YYYY')
                }}
              </span>
              <span
                v-if="
                  movie.last_air_date &&
                  formatDate(movie.last_air_date, 'YYYY') !==
                    formatDate(movie.first_air_date, 'YYYY')
                "
              >
                - {{ formatDate(movie.last_air_date, 'YYYY') }}
              </span>
            </div>

            <div class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-star-fill mr-2 text-yellow-500"></i>
              <span>{{ movie.vote_average.toFixed(2) }}</span>
            </div>

            <div v-if="movie.runtime" class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-timer-2-fill mr-2 text-blue-500"></i>
              <span>{{ movie.runtime }} min</span>
            </div>
          </div>

          <div v-if="movie.genres" class="flex items-center gap-2">
            <span
              v-for="genre in movie.genres"
              :key="genre.id"
              class="rounded-sm bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-700"
            >
              {{ genre.name }}
            </span>
          </div>

          <p
            v-if="movie.overview"
            class="no-scrollbar flex-1 overflow-y-auto text-justify leading-7"
          >
            {{ movie.overview }}
          </p>
        </div>
      </div>

      <!-- 观看记录 -->
      <div v-if="movie.records?.length > 0" class="space-y-3">
        <div
          v-for="record in movie.records"
          :key="record.id"
          :class="[
            'flex w-full flex-row-reverse items-center gap-3 overflow-hidden rounded-md p-3',
            movieRatingMap[record.rating].bgColor,
          ]"
        >
          <UiActions
            v-if="user && user?.app_metadata?.role === 'admin'"
            direction="left"
            :customClass="{
              base: `${movieRatingMap[record.rating].bgColor} ${movieRatingMap[record.rating].color} rounded-sm flex-none`,
              hover: `${movieRatingMap[record.rating].hoverColor}`,
            }"
            :isDeleting="isDeleting"
            @edit="handleEdit(record.id)"
            @delete="handleDelete(record.id)"
          />

          <div class="flex flex-none items-center gap-3">
            <div :class="movieRatingMap[record.rating].color">
              {{ movieRatingMap[record.rating].text }}
            </div>
            <img :src="movieRatingMap[record.rating].gif" class="h-5 w-5" />
          </div>

          <div class="flex-1"></div>

          <div class="flex flex-none items-center gap-3">
            <div class="font-bold">{{ record.watch_date }}</div>
            <div class="text-zinc-500 dark:text-zinc-400">看过</div>
            <div class="space-x-1 text-blue-500 dark:text-blue-400">
              <i :class="movieChannelMap[record.watch_channel].icon"></i>
              <span>{{ movieChannelMap[record.watch_channel].text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 演职员 -->
      <UiScrollView v-if="credits" customClass="gap-3 ">
        <div v-for="credit in credits" class="w-20 flex-none text-xs sm:w-28">
          <div
            class="mb-2 h-30 w-full overflow-hidden rounded-md bg-zinc-100 sm:h-42 dark:bg-zinc-700"
          >
            <img
              v-if="credit.profile_path"
              :src="`/api/tmdb/img/w185${credit.profile_path}`"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="line-clamp-2 font-medium">{{ credit.name }}</div>
          <div class="line-clamp-2 text-zinc-500 dark:text-zinc-400">
            {{ credit.character || credit.job }}
          </div>
        </div>
      </UiScrollView>

      <!-- 背景图 -->
      <div
        v-if="movie.backdrop_path"
        class="w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
      >
        <img
          :src="`/api/tmdb/img/w1280${movie.backdrop_path}`"
          class="w-full object-cover"
        />
      </div>

      <!-- 剧集季 -->
      <div v-if="movie.seasons" class="space-y-3">
        <h3 class="flex items-baseline justify-between text-xl">
          <span class="font-bold">全部季</span>
          <span class="text-sm text-zinc-500 dark:text-zinc-400">
            共 {{ movie.number_of_seasons }} 季
            {{ movie.number_of_episodes }} 集
          </span>
        </h3>
        <div
          v-for="season in movie.seasons"
          :key="season.id"
          class="flex overflow-hidden rounded-md border border-zinc-200 py-2 pl-2 dark:border-zinc-600"
        >
          <div
            class="h-36 w-24 flex-none overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-700"
          >
            <img
              v-if="season.poster_path"
              :src="`/api/tmdb/img/w154${season.poster_path}`"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="space-y-2 px-3 py-1 text-xs">
            <div class="w-fit text-sm font-bold">
              {{ season.name }}
            </div>
            <div class="font-medium text-zinc-500 dark:text-zinc-400">
              <span>
                {{ season.air_date }}
              </span>
              <span> / {{ season.episode_count }} 集</span>
              <span v-if="season.vote_average">
                / {{ season.vote_average.toFixed(2) }}
              </span>
            </div>
            <p
              class="line-clamp-3 text-justify text-zinc-500 dark:text-zinc-400"
            >
              {{ season.overview || movie.overview }}
            </p>
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

const {
  isDeleting,
  fetchMovieDetail,
  fetchMovieCredits,
  fetchMovieRecordsByTmdbId,
  fetchMovieRecords,
  deleteMovieRecord,
} = useMovies()

const credits = computed(() => {
  if (!movie.value || !movie.value.credits) return []

  const cs = movie.value.credits
  const crew = cs.crew.filter((item) => item.job === 'Director')
  const creator =
    movie.value.created_by?.map((item) => ({
      ...item,
      job: 'Creator',
    })) ?? []

  return [...crew, ...creator, ...cs.cast.slice(0, 10)]
})

const { data: movie, pending: isLoading } = await useLazyAsyncData(async () => {
  const [_, prefix, tmdbId, seasonNumber] =
    route.params.id.match(/^([mt])(\d+)(?:s(\d+))?$/) || []

  const mediaType = prefix === 'm' ? 'movie' : 'tv'
  const path = seasonNumber ? `${tmdbId}/season/${seasonNumber}` : tmdbId

  const [movieDetail, seasonDetail, credits, records] = await Promise.all([
    fetchMovieDetail(mediaType, tmdbId),
    seasonNumber ? fetchMovieDetail(mediaType, path) : null,
    fetchMovieCredits(mediaType, seasonNumber ? path : tmdbId),
    fetchMovieRecordsByTmdbId(tmdbId),
  ])

  let movieData = {
    ...movieDetail,
    credits,
    records,
  }

  if (seasonNumber) {
    movieData.poster_path = seasonDetail.poster_path
    movieData.name = movieDetail.name + ' ' + seasonDetail.name
    movieData.first_air_date = seasonDetail.air_date
    movieData.overview = seasonDetail.overview || movieDetail.overview
    movieData.vote_average =
      seasonDetail.vote_average || movieDetail.vote_average
  }

  return movieData
})

const handleEdit = (id) => {
  router.push(`/movie/add?id=${id}`)
}

const handleDelete = async (id) => {
  await deleteMovieRecord(id)

  movie.value.records = movie.value.records.filter((item) => item.id !== id)

  triggerRef(movie)

  if (movie.value.records.length === 0) {
    fetchMovieRecords()
    router.push('/movie')
  }
}

useSeoMeta({
  title: () => movie.value?.title || movie.value?.name || '电影详情',
  description: () => movie.value?.overview || '',
})
</script>
