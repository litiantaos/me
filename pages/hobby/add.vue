<template>
  <UiLayout
    :title="isEditMode ? '编辑记录' : '新记录'"
    :isLoading="isSearching"
  >
    <div class="space-y-4">
      <UiMessage v-if="errorMsg" type="error" :text="errorMsg" />

      <UiTabs
        v-if="!isEditMode"
        v-model="searchType"
        :tabs="[
          { label: '影视', value: 'video', icon: 'ri-youtube-fill' },
          { label: '游戏', value: 'game', icon: 'ri-gamepad-fill' },
        ]"
        @update:model-value="
          () => {
            searchResults = []
            selectedItem = null
          }
        "
      />

      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="
          searchType === 'game' ? '最近玩了什么？' : '最近看了什么？'
        "
        class="input-base w-full"
        @keydown.enter="handleSearch"
      />

      <div v-if="searchResults.length > 0" class="space-y-2">
        <TransitionGroup name="list">
          <button
            v-for="item in searchResults"
            :key="item.id"
            class="flex w-full items-center gap-2 rounded-md border border-zinc-200 p-2 text-left transition-colors duration-300 dark:border-zinc-600"
            :class="
              selectedItem
                ? 'cursor-default bg-zinc-50 dark:bg-zinc-700/30'
                : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/30'
            "
            @click="selectItem(item)"
          >
            <div
              class="h-24 w-16 flex-none overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-700"
            >
              <img
                v-if="item.poster"
                :src="
                  item.type === 'game'
                    ? item.poster
                    : `/api/tmdb/img/w342${item.poster}`
                "
                class="h-full w-full object-cover"
              />
            </div>

            <div class="space-y-2 text-xs">
              <NuxtLink
                :to="`/hobby/${item.type}/${item.id}`"
                class="block w-fit text-sm font-bold hover:text-blue-500 dark:hover:text-blue-400"
                @click.stop
              >
                {{ item.title }}
              </NuxtLink>
              <div class="flex items-center gap-1">
                <span>
                  {{
                    item.type === 'movie'
                      ? '电影'
                      : item.type === 'tv'
                        ? '剧集'
                        : item.type === 'game'
                          ? '游戏'
                          : '其他'
                  }}
                </span>
                <span>/</span>
                <span>{{ item.release_date }}</span>
              </div>
              <p
                class="line-clamp-2 text-justify text-zinc-500 dark:text-zinc-400"
              >
                {{ item.overview }}
              </p>
            </div>
          </button>
        </TransitionGroup>
      </div>

      <div
        v-if="selectedItem"
        class="space-y-6 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
      >
        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            日期
          </label>
          <input
            v-model="hobbyRecordData.date"
            type="text"
            placeholder="YYYY-MM-DD"
            maxlength="10"
            class="input-base w-full"
            @input="handleDateInput"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-zinc-500 dark:text-zinc-400">
            渠道
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(item, key) in hobbyChannelMap[selectedItem.type]"
              :key="key"
              class="btn-base w-auto! gap-2 py-3 text-xs"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  hobbyRecordData.channel === key,
              }"
              @click="hobbyRecordData.channel = key"
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
              v-for="(item, key) in hobbyRatingMap"
              :key="key"
              class="group btn-base h-auto! w-auto! flex-col gap-3 py-3"
              :class="{
                'text-blue-500 ring-1 ring-blue-500 dark:text-blue-400 dark:ring-blue-400':
                  hobbyRecordData.rating === Number(key),
              }"
              @click="hobbyRecordData.rating = Number(key)"
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
          v-if="hobbyRecordData.date"
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
  hobbies,
  isSearching,
  isAdding,
  searchHobbies,
  fetchHobbyRecords,
  addHobbyRecord,
} = useHobby()

const inputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const searchType = ref('video')
const selectedItem = ref(null)
const errorMsg = ref('')

const hobbyRecordData = ref({
  date: formatDate(new Date(), 'YYYY-MM-DD'),
  channel: '',
  rating: 3,
})

const isEditMode = computed(() => {
  return route.query.id ? true : false
})

const fetchEditingHobbyRecord = async () => {
  const editingHobbyData = useState('editing_hobby_data')

  if (editingHobbyData.value) {
    const { record, detail } = editingHobbyData.value

    selectItem(detail)

    hobbyRecordData.value = {
      date: record.date,
      channel: record.channel,
      rating: record.rating,
    }

    editingHobbyData.value = null
    return
  }

  // 刷新/直达：编辑状态丢失时按记录 id 回查恢复
  try {
    if (hobbies.value.length === 0) await fetchHobbyRecords()

    // query.id 为字符串，id 为数字，需统一类型比较
    const record = hobbies.value.find(
      (r) => String(r.id) === String(route.query.id),
    )
    if (!record) throw new Error('未找到该记录')

    selectItem({
      id: record.hobby_id,
      type: record.type,
      title: record.title,
      poster: record.poster,
    })

    hobbyRecordData.value = {
      date: record.date,
      channel: record.channel,
      rating: record.rating,
    }
  } catch (error) {
    console.error('恢复编辑记录失败', error)
    errorMsg.value = '未找到该记录，正在返回列表'
    setTimeout(() => navigateTo('/hobby'), 1500)
  }
}

const handleSearch = throttle(async (e) => {
  if (e.isComposing) return
  if (!searchQuery.value.trim()) return

  selectedItem.value = null
  searchResults.value = await searchHobbies(searchType.value, searchQuery.value)
})

const selectItem = async (item) => {
  if (selectedItem.value) return

  selectedItem.value = item
  searchResults.value = [item]

  const type = item.type
  hobbyRecordData.value.channel = Object.keys(hobbyChannelMap[type])[0]
}

const handleDateInput = (e) => {
  const el = e.target
  let pos = el.selectionStart

  let v = el.value.replace(/\D/g, '')

  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4)
  if (v.length > 7) v = v.slice(0, 7) + '-' + v.slice(7)

  hobbyRecordData.value.date = v

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
  if (!selectedItem.value) return

  errorMsg.value = ''

  if (!validateDate(hobbyRecordData.value.date)) {
    errorMsg.value = '日期无效'
    return
  }

  try {
    const data = {
      hobby_id: selectedItem.value.id,
      type: selectedItem.value.type,
      title: selectedItem.value.title,
      poster: selectedItem.value.poster,
      date: hobbyRecordData.value.date,
      channel: hobbyRecordData.value.channel,
      rating: hobbyRecordData.value.rating,
    }

    await addHobbyRecord(data, route.query.id || null)

    router.push(`/hobby/${data.type}/${data.hobby_id}`)
  } catch (error) {
    console.error('保存记录失败', error)
    errorMsg.value = '保存失败，请重试'
  }
})

onMounted(() => {
  if (isEditMode.value) {
    fetchEditingHobbyRecord()
  }

  inputRef.value?.focus()
})

useSeoMeta({
  title: () => (isEditMode.value ? '编辑记录' : '新记录'),
})
</script>
