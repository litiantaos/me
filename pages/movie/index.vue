<template>
  <UiLayout title="已看影视" :isLoading="isMoviesLoading">
    <div class="space-y-10">
      <div
        v-if="user && user?.app_metadata?.role === 'admin'"
        class="flex gap-6"
      >
        <NuxtLink to="/movie/add" class="link-color">Add</NuxtLink>
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
              :to="`/movie/${movie.id}`"
              class="relative block space-y-2"
            >
              <div
                class="aspect-2/3 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
              >
                <img
                  v-if="movie.poster_path"
                  :src="`/api/tmdb/img/original${movie.poster_path}`"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="space-y-1">
                <h3 class="truncate font-medium">{{ movie.title }}</h3>
                <div
                  v-if="movie.rating"
                  class="flex items-center gap-1 text-xs text-zinc-500"
                >
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

const { movies, isMoviesLoading, fetchMovies } = useMovies()

// 按月份分组电影
const moviesByMonth = computed(() => {
  if (!movies.value) return []

  const groups = {}

  movies.value.forEach((movie) => {
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
    fetchMovies()
  }
})

useSeoMeta({
  title: '已看影视',
})
</script>
