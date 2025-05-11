<template>
  <UiLayout>
    <div class="space-y-10">
      <div v-if="user">
        <NuxtLink to="/note/new" class="link-color">New</NuxtLink>
      </div>

      <template v-if="!isLoading && notes.length > 0">
        <div v-for="note in notes" :key="note.id">
          <NuxtLink :to="`/note/${note.id}`">
            <UiNote :note="note" />
          </NuxtLink>
        </div>
      </template>

      <template v-else>
        <UiLoader />
      </template>
    </div>
  </UiLayout>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const notes = ref([])
const isLoading = ref(false)

const fetchNotes = async () => {
  isLoading.value = true

  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    notes.value = data
  } catch (error) {
    console.error('获取笔记失败', error)
  } finally {
    isLoading.value = false
  }
}

fetchNotes()
</script>
