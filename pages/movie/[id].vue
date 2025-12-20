<template>
  <UiLayout :isLoading="isLoading">
    <div v-if="movieData" class="space-y-6">
      <div class="flex flex-col gap-6 sm:flex-row">
        <div
          class="h-72 w-48 flex-none overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
        >
          <img
            v-if="movieData.detail.poster_path"
            :src="`/api/tmdb/img/w342${movieData.detail.poster_path}`"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="flex flex-1 flex-col gap-4 overflow-hidden sm:h-72">
          <h2 class="text-2xl font-bold">
            <span>{{ movieData.detail.title || movieData.detail.name }}</span>
            <span
              v-if="movieData.detail.original_language !== 'zh'"
              class="text-zinc-400"
            >
              （{{
                movieData.detail.original_title ||
                movieData.detail.original_name
              }}）
            </span>
          </h2>

          <div class="flex items-center font-medium">
            <div>
              <span>
                {{ movieData.media_type === 'movie' ? 'Movie' : 'TV' }}
              </span>
            </div>

            <div>
              <span class="mx-3 text-zinc-300">｜</span>
              <span>
                {{
                  formatDate(
                    movieData.detail.release_date ||
                      movieData.detail.first_air_date,
                    'YYYY',
                  )
                }}
              </span>
              <span v-if="movieData.detail.last_air_date">
                - {{ formatDate(movieData.detail.last_air_date, 'YYYY') }}
              </span>
            </div>

            <div class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-star-fill mr-2 text-yellow-500"></i>
              <span>{{ movieData.detail.vote_average }}</span>
            </div>

            <div v-if="movieData.detail.runtime" class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-timer-2-fill mr-2 text-blue-500"></i>
              <span>{{ movieData.detail.runtime }} min</span>
            </div>
          </div>

          <div v-if="movieData?.detail.genres" class="flex items-center gap-2">
            <span
              v-for="genre in movieData.detail.genres"
              :key="genre.id"
              class="rounded-sm bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-700"
            >
              {{ genre.name }}
            </span>
          </div>

          <p
            v-if="movieData.detail.overview"
            class="no-scrollbar flex-1 overflow-y-auto text-justify leading-7"
          >
            {{ movieData.detail.overview }}
          </p>
        </div>
      </div>

      <div
        :class="[
          'flex w-full items-center justify-between gap-2 rounded-md p-3',
          movieRatingMap[movieData.rating].bgColor,
        ]"
      >
        <div>
          <span class="mr-2 font-bold">{{ movieData.watch_date }}</span>
          <span class="text-zinc-500 dark:text-zinc-400">看过</span>
        </div>
        <div class="flex items-center gap-2">
          <div :class="movieRatingMap[movieData.rating].color">
            {{ movieRatingMap[movieData.rating].text }}
          </div>
          <img :src="movieRatingMap[movieData.rating].gif" class="h-5 w-5" />
        </div>
      </div>

      <div
        v-if="movieData?.credits?.cast"
        class="no-scrollbar flex gap-3 overflow-x-auto text-xs"
      >
        <div
          v-for="cast in movieData?.credits?.cast.slice(0, 10)"
          class="w-28 flex-none"
        >
          <div
            class="mb-2 h-42 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
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
        v-if="movieData?.detail.backdrop_path"
        class="w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
      >
        <img
          :src="`/api/tmdb/img/w1280${movieData.detail.backdrop_path}`"
          class="w-full object-cover"
          @error="(e) => console.log('浏览器报错了:', e)"
        />
      </div>

      <UiActions
        v-if="user && user?.app_metadata?.role === 'admin'"
        :isDeleting="isDeleting"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </UiLayout>
</template>

<script setup>
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const {
  fetchMovie,
  fetchMovieDetail,
  fetchMovieCredits,
  deleteMovie,
  isDeleting,
} = useMovies()

const { data: movieData, pending: isLoading } = await useLazyAsyncData(
  async () => {
    const movie = await fetchMovie(route.params.id)

    if (movie && movie.tmdb_id) {
      const [detail, credits] = await Promise.all([
        fetchMovieDetail(movie.tmdb_id, movie.media_type),
        fetchMovieCredits(movie.tmdb_id, movie.media_type),
      ])

      return {
        ...movie,
        detail,
        credits,
      }
    }

    return movie
  },
)

const handleEdit = () => {
  router.push(`/movie/add?id=${route.params.id}`)
}

const handleDelete = async () => {
  await deleteMovie(route.params.id)
  router.push('/movie')
}

useSeoMeta({
  title: () => movieData.value?.title || movieData.value?.name || '电影详情',
  description: () => movieData.value?.overview || '',
})
</script>
