<template>
  <main>
    <Header />
    
    <div class="container mx-auto py-8 px-4 max-w-2xl">
      <div class="flex items-center mb-6">
        <button 
          @click="$router.go(-1)"
          class="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Назад
        </button>
        <h2 class="text-3xl font-bold">Редагувати голосування</h2>
      </div>
      
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Завантаження...</p>
      </div>
      
      <div v-else-if="voting" class="bg-white p-6 rounded-lg shadow">
        <form @submit.prevent="updateVoting" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Назва голосування *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введіть назву голосування"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Опис *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Детальний опис голосування"
            ></textarea>
          </div>

          <div>
            <label for="tag" class="block text-sm font-medium text-gray-700 mb-1">
              Категорія *
            </label>
            <select
              id="tag"
              v-model="form.tag"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Оберіть категорію</option>
              <option value="feature">Нова функція</option>
              <option value="improvement">Покращення</option>
              <option value="bug">Виправлення помилки</option>
              <option value="policy">Політика</option>
              <option value="general">Загальне</option>
              <option value="other">Інше</option>
            </select>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Зберігаємо...' : 'Зберегти зміни' }}
            </button>
            
            <button
              type="button"
              @click="$router.go(-1)"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
      
      <div v-else class="text-center text-red-600">
        Голосування не знайдено або у вас немає прав для редагування
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const voting = ref<any>(null)

const form = reactive({
  title: '',
  description: '',
  tag: ''
})

const fetchVoting = async () => {
  try {
    const response = await api.get(`/votings/${route.params.id}`)
    if (response.data.success) {
      voting.value = response.data.data
      if (voting.value.author_id !== authStore.user?.uid && authStore.user?.role !== 'admin') {
        error.value = 'У вас немає прав для редагування цього голосування'
        return
      }
      if (voting.value.status !== 'active') {
        error.value = 'Можна редагувати тільки активні голосування'
        return
      }
      form.title = voting.value.title
      form.description = voting.value.description
      form.tag = voting.value.tag
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Помилка при завантаженні голосування'
  } finally {
    loading.value = false
  }
}

const updateVoting = async () => {
  try {
    submitting.value = true
    error.value = null

    const response = await api.put(`/votings/${route.params.id}`, form)

    if (response.data.success) {
      alert('Голосування оновлено успішно!')
      router.push(`/votings/${route.params.id}`)
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Помилка при оновленні голосування'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchVoting()
})
</script>