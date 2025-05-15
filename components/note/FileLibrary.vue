<template>
  <div class="mt-4 space-y-3">
    <div class="flex h-8 items-center gap-3">
      <div class="flex gap-3">
        <button
          @click="activeTab = 'images'"
          :class="{ 'font-medium text-blue-500': activeTab === 'images' }"
        >
          图片
        </button>
        <button
          @click="activeTab = 'videos'"
          :class="{ 'font-medium text-blue-500': activeTab === 'videos' }"
        >
          视频
        </button>
      </div>

      <div class="flex-1">
        <UiLoader v-if="isLoading" />
      </div>

      <div class="flex">
        <button class="ri-add-line text-lg" @click="openFileUpload"></button>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          class="hidden"
          :accept="activeTab === 'images' ? 'image/*' : 'video/*'"
        />
      </div>
    </div>

    <ul v-if="files.length > 0" class="space-y-3">
      <li v-for="file in files" :key="file.name" class="py-3">
        <div class="flex gap-3">
          <p
            class="cursor-pointer truncate font-medium sm:hover:text-blue-500"
            @click="togglePreview(file)"
          >
            {{ file.name }}
          </p>
          <button
            class="ri-clipboard-line text-base text-gray-400 sm:hover:text-blue-500"
            @click="copyText(file.url)"
          ></button>
        </div>

        <div class="flex h-6 items-center gap-2 text-xs text-gray-400">
          <span>{{ formatDate(file.created_at) }}</span>
          <span>·</span>
          <span>{{ formatFileSize(file.metadata.size) }}</span>

          <button
            v-if="file.showPreview"
            class="ri-delete-bin-7-line ml-2 sm:hover:text-red-600"
            @click="deleteFile(file)"
          ></button>
        </div>

        <!-- 预览区域 -->
        <div v-if="file.showPreview" class="mt-4 w-1/2 border border-gray-200">
          <img
            v-if="file.metadata.mimetype.startsWith('image/')"
            :src="file.url"
            alt="图片预览"
            class="w-full"
          />

          <video
            v-else-if="file.metadata.mimetype.startsWith('video/')"
            :src="file.url"
            controls
            class="w-full"
          ></video>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const config = useRuntimeConfig()

const isLoading = ref(false)
const files = ref([])
const activeTab = ref('images')

const fetchFiles = async () => {
  isLoading.value = true
  files.value = []

  try {
    const { data, error } = await client.storage
      .from('main')
      .list(activeTab.value)

    if (error) throw error

    files.value = data.map((file) => {
      return {
        ...file,
        url: `${config.public.supabaseUrl}/storage/v1/object/public/main/${activeTab.value}/${file.name}`,
      }
    })
  } catch (err) {
    console.error('获取文件列表失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 切换预览显示状态
const togglePreview = async (file) => {
  file.showPreview = !file.showPreview
}

// 打开文件上传对话框
const fileInput = ref(null)
const openFileUpload = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isLoading.value = true

  try {
    // 保留原始文件名，并在后面附加时间戳
    const fileNameParts = file.name.split('.')
    const fileExt = fileNameParts.pop() // 获取扩展名
    const baseName = fileNameParts.join('.') // 获取基本文件名（不含扩展名）
    const fileName = `${baseName}_${Date.now()}.${fileExt}`

    // 上传文件到对应的文件夹
    const { error } = await client.storage
      .from('main')
      .upload(`${activeTab.value}/${fileName}`, file)

    if (error) throw error

    // 上传成功后刷新文件列表
    await fetchFiles()
  } catch (err) {
    console.error('文件上传失败:', err)
  } finally {
    isLoading.value = false
    // 清空文件输入，允许重复上传相同文件
    event.target.value = null
  }
}

// 删除文件
const deleteFile = async (file) => {
  if (!confirm('确定要删除此文件吗？')) return

  isLoading.value = true

  try {
    // 从存储中删除文件
    const { error } = await client.storage
      .from('main')
      .remove([`${activeTab.value}/${file.name}`])

    if (error) throw error

    // 删除成功后刷新文件列表
    await fetchFiles()
  } catch (err) {
    console.error('文件删除失败:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFiles()
})

// 监听activeTab变化，切换时重新获取文件
watch(activeTab, () => {
  fetchFiles()
})
</script>
