<template>
  <UiLayout :isLoading="isLoading">
    <div v-if="movie" class="space-y-6">
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
                  movie.last_air_date !== movie.first_air_date
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

      <div
        v-if="movie?.credits?.cast"
        class="no-scrollbar flex gap-3 overflow-x-auto text-xs"
      >
        <div
          v-for="cast in movie?.credits?.cast.slice(0, 10)"
          class="w-20 flex-none sm:w-28"
        >
          <div
            class="mb-2 h-30 w-full overflow-hidden rounded-md bg-zinc-100 sm:h-42 dark:bg-zinc-700"
          >
            <img
              v-if="cast.profile_path"
              :src="`/api/tmdb/img/w185${cast.profile_path}`"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="line-clamp-2 font-medium">{{ cast.name }}</div>
          <div class="line-clamp-2 text-zinc-500 dark:text-zinc-400">
            {{ cast.character }}
          </div>
        </div>
      </div>

      <div
        v-if="movie.backdrop_path"
        class="w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
      >
        <img
          :src="`/api/tmdb/img/w1280${movie.backdrop_path}`"
          class="w-full object-cover"
        />
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

const { data: movie, pending: isLoading } = await useLazyAsyncData(async () => {
  const tmdbId = route.params.id.slice(1)
  const mediaType = route.params.id[0] === 'm' ? 'movie' : 'tv'

  const [detail, credits, records] = await Promise.all([
    fetchMovieDetail(tmdbId, mediaType),
    fetchMovieCredits(tmdbId, mediaType),
    fetchMovieRecordsByTmdbId(tmdbId),
  ])

  return {
    ...detail,
    credits,
    records,
  }
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
