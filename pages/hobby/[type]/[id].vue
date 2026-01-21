<template>
  <UiLayout :isLoading="isLoading">
    <div v-if="hobbyDetail" class="space-y-6">
      <!-- 影视详情 -->
      <div class="flex flex-col gap-6 sm:flex-row">
        <div
          class="h-72 w-48 flex-none overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
        >
          <img
            v-if="hobbyDetail.poster"
            :src="hobbyDetail.poster"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="flex flex-1 flex-col gap-4 overflow-hidden sm:h-72">
          <h2 class="text-2xl font-bold">
            <span>{{ hobbyDetail.title }}</span>
            <span
              v-if="
                hobbyDetail.original_language !== 'zh' &&
                hobbyDetail.title !== hobbyDetail.original_title
              "
              class="text-lg text-zinc-400"
            >
              （{{ hobbyDetail.original_title }}）
            </span>
          </h2>

          <div class="flex items-center font-medium">
            <div>
              <span>
                {{
                  hobbyDetail.type?.charAt(0).toUpperCase() +
                  hobbyDetail.type?.slice(1)
                }}
              </span>
            </div>

            <div>
              <span class="mx-3 text-zinc-300">｜</span>
              <span>
                {{ formatDate(hobbyDetail.release_date, 'YYYY') }}
              </span>
              <span
                v-if="
                  hobbyDetail.last_air_date &&
                  formatDate(hobbyDetail.last_air_date, 'YYYY') !==
                    formatDate(hobbyDetail.release_date, 'YYYY')
                "
              >
                - {{ formatDate(hobbyDetail.last_air_date, 'YYYY') }}
              </span>
            </div>

            <div v-if="hobbyDetail.developers" class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <span>{{ hobbyDetail.developers[0] }}</span>
            </div>

            <div v-if="hobbyDetail.score" class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-star-fill mr-2 text-yellow-500"></i>
              <span>{{ hobbyDetail.score.toFixed(2) }}</span>
            </div>

            <div v-if="hobbyDetail.runtime" class="flex items-center">
              <span class="mx-3 text-zinc-300">｜</span>
              <i class="ri-timer-2-fill mr-2 text-blue-500"></i>
              <span>{{ hobbyDetail.runtime }} min</span>
            </div>
          </div>

          <div
            v-if="hobbyDetail.genres?.length > 0"
            class="flex items-center gap-2"
          >
            <span
              v-for="genre in hobbyDetail.genres"
              :key="genre.id"
              class="rounded-sm bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-700"
            >
              {{ genre.name }}
            </span>
          </div>

          <p
            v-if="hobbyDetail.overview"
            class="no-scrollbar flex-1 overflow-y-auto text-justify leading-7"
          >
            {{ hobbyDetail.overview }}
          </p>
        </div>
      </div>

      <!-- 观看记录 -->
      <div v-if="hobbyDetail.records?.length > 0" class="space-y-3">
        <div
          v-for="record in hobbyDetail.records"
          :key="record.id"
          :class="[
            'flex w-full flex-row-reverse items-center gap-3 overflow-hidden rounded-md p-3',
            hobbyRatingMap[record.rating].bgColor,
          ]"
        >
          <UiActions
            v-if="user && user?.app_metadata?.role === 'admin'"
            direction="left"
            :customClass="{
              base: `${hobbyRatingMap[record.rating].bgColor} ${hobbyRatingMap[record.rating].color} rounded-sm flex-none`,
              hover: `${hobbyRatingMap[record.rating].hoverColor}`,
            }"
            :isDeleting="isDeleting"
            @edit="handleEdit(record.id)"
            @delete="handleDelete(record.id)"
          />

          <div class="flex flex-none items-center gap-3">
            <div :class="hobbyRatingMap[record.rating].color">
              {{ hobbyRatingMap[record.rating].text }}
            </div>
            <img :src="hobbyRatingMap[record.rating].gif" class="h-5 w-5" />
          </div>

          <div class="flex-1"></div>

          <div class="flex flex-none items-center gap-3">
            <div class="font-bold">{{ record.date }}</div>
            <div class="text-zinc-500 dark:text-zinc-400">看过</div>
            <div class="space-x-1 text-blue-500 dark:text-blue-400">
              <i :class="hobbyChannelMap[type]?.[record.channel].icon"></i>
              <span>{{ hobbyChannelMap[type]?.[record.channel].text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 演职员 -->
      <UiScrollView v-if="credits?.length > 0" customClass="gap-3 ">
        <div v-for="credit in credits" class="w-20 flex-none text-xs sm:w-28">
          <div
            class="mb-2 flex h-30 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-100 text-xl text-zinc-300 sm:h-42 dark:bg-zinc-700 dark:text-zinc-500"
          >
            <img
              v-if="credit.profile_path"
              :src="`/api/tmdb/img/w185${credit.profile_path}`"
              class="h-full w-full object-cover"
            />
            <i v-else class="ri-landscape-fill"></i>
          </div>
          <div class="line-clamp-2 font-medium">{{ credit.name }}</div>
          <div class="line-clamp-2 text-zinc-500 dark:text-zinc-400">
            {{ credit.character || credit.job }}
          </div>
        </div>
      </UiScrollView>

      <!-- 游戏截图 -->
      <UiScrollView
        v-if="hobbyDetail.screenshots?.length > 0"
        customClass="gap-3 "
      >
        <div
          v-for="shot in hobbyDetail.screenshots"
          :key="shot.id"
          class="h-32 w-48 flex-none overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
        >
          <img :src="shot.path_thumbnail" class="h-full w-full object-cover" />
        </div>
      </UiScrollView>

      <!-- 背景图 -->
      <div
        v-if="hobbyDetail.backdrop"
        class="w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-700"
      >
        <img :src="hobbyDetail.backdrop" class="h-full w-full object-cover" />
      </div>

      <!-- 剧集季 -->
      <div v-if="hobbyDetail.seasons?.length > 0" class="space-y-3">
        <h3 class="flex items-baseline justify-between text-xl">
          <span class="font-bold">全部季</span>
          <span class="text-sm text-zinc-500 dark:text-zinc-400">
            共 {{ hobbyDetail.number_of_seasons }} 季
            {{ hobbyDetail.number_of_episodes }} 集
          </span>
        </h3>
        <div
          v-for="season in hobbyDetail.seasons"
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
              {{ season.overview || hobbyDetail.overview }}
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
  hobbies,
  isDeleting,
  fetchHobbyDetail,
  fetchHobbyCredits,
  fetchHobbyRecordsByHobbyId,
  deleteHobbyRecord,
} = useHobby()

const { type, id } = route.params

const { data: hobbyDetail, pending: isLoading } = await useLazyAsyncData(
  async () => {
    const [detail, credits, records] = await Promise.all([
      fetchHobbyDetail(type, id),
      fetchHobbyCredits(type, id),
      fetchHobbyRecordsByHobbyId(id),
    ])

    return {
      ...detail,
      credits,
      records,
    }
  },
)

const credits = computed(() => {
  if (Object.keys(hobbyDetail.value?.credits).length === 0) return []

  const cs = hobbyDetail.value.credits

  const crew = cs.crew
    .filter((item) => item.job === 'Director')
    .map((item) => ({ ...item, job: '导演' }))

  const creator =
    hobbyDetail.value.created_by?.map((item) => ({
      ...item,
      job: '创作者',
    })) ?? []

  return [...crew, ...creator, ...cs.cast.slice(0, 10)]
})

const handleEdit = (id) => {
  const record = hobbyDetail.value.records.find((r) => r.id === id)

  if (record) {
    useState('editing_hobby_data', () => ({
      record,
      detail: hobbyDetail.value,
    }))
  }

  router.push(`/hobby/add?id=${id}`)
}

const handleDelete = async (id) => {
  await deleteHobbyRecord(id)

  hobbies.value = hobbies.value.filter((item) => item.id !== id)

  triggerRef(hobbies)

  if (hobbyDetail.value.records.length === 0) {
    router.push('/hobby')
  }
}

useSeoMeta({
  title: () => hobbyDetail.value?.title || '电影详情',
  description: () => hobbyDetail.value?.overview || '',
})
</script>
