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
        <h2 class="text-3xl font-bold">Створити голосування</h2>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <form @submit.prevent="createVoting" class="space-y-6">
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
              :disabled="loading"
              class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Створюємо...' : 'Створити голосування' }}
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
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import api from '@/services/api'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  title: '',
  description: '',
  tag: ''
})

const createVoting = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.post('/votings', form)

    if (response.data.success) {
      alert('Голосування створено успішно!')
      router.push('/votings')
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Помилка при створенні голосування'
  } finally {
    loading.value = false
  }
}
</script>