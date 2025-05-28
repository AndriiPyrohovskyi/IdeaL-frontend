<template>
    <main>
      <Header />
      
      <div class="container mx-auto py-8 px-4 max-w-4xl">
        <div class="flex items-center mb-6">
          <button 
            @click="$router.go(-1)"
            class="mr-4 text-blue-500 hover:text-blue-700"
          >
            ← Назад
          </button>
          <h2 class="text-3xl font-bold">Деталі голосування</h2>
        </div>
        
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Завантаження...</p>
        </div>
        
        <div v-else-if="voting" class="bg-white rounded-lg shadow p-6">
          <h1 class="text-2xl font-bold mb-4">{{ voting.title }}</h1>
          <p class="text-gray-700 mb-6">{{ voting.description }}</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold mb-2">Інформація</h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-gray-600">Категорія:</span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                    {{ voting.tag }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">Створено:</span>
                  <span class="ml-2">{{ formatDate(voting.created_at) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Статус:</span>
                  <span 
                    :class="getStatusClass(voting.status)"
                    class="ml-2 px-2 py-1 rounded text-sm"
                  >
                    {{ getStatusText(voting.status) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="font-semibold mb-2">Статистика</h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-gray-600">Загальна кількість голосів:</span>
                  <span class="ml-2 font-bold">{{ voteCount }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Ваш голос:</span>
                  <span class="ml-2" :class="userVoted ? 'text-green-600' : 'text-gray-400'">
                    {{ userVoted ? 'Проголосовано' : 'Не голосували' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="border-t pt-6">
            <div class="flex space-x-4">
              <button 
                v-if="voting.status === 'active'"
                @click="handleVote"
                :disabled="isVoting"
                :class="userVoted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
                class="text-white px-6 py-2 rounded disabled:opacity-50 transition-colors"
              >
                {{ getVoteButtonText() }}
              </button>
              
              <button 
                v-if="canEdit"
                @click="editVoting"
                class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Редагувати
              </button>
              
              <button 
                v-if="canClose && voting.status === 'active'"
                @click="closeVoting"
                class="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Закрити голосування
              </button>
              
              <button 
                v-if="canDelete"
                @click="deleteVoting"
                class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Видалити
              </button>
            </div>
          </div>
          
          <div v-if="voting.result_text" class="mt-6 p-4 bg-gray-100 rounded">
            <h3 class="font-semibold mb-2">Результат:</h3>
            <p>{{ voting.result_text }}</p>
          </div>
        </div>
        
        <div v-else class="text-center text-red-600">
          Голосування не знайдено
        </div>
      </div>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Header from '@/components/Header.vue'
  import { useAuthStore } from '@/stores/auth'
  import api from '@/services/api'
  
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  
  const voting = ref<any>(null)
  const loading = ref(true)
  const isVoting = ref(false)
  const voteCount = ref(0)
  const userVoted = ref(false)
  
  const canEdit = computed(() => {
    return authStore.user?.uid === voting.value?.author_id || authStore.isAdmin
  })
  
  const canClose = computed(() => {
    return authStore.user?.uid === voting.value?.author_id
  })
  
  const canDelete = computed(() => {
    return authStore.user?.uid === voting.value?.author_id || authStore.isAdmin
  })
  
  const fetchVoting = async () => {
    try {
      const response = await api.get(`/votings/${route.params.id}`)
      if (response.data.success) {
        voting.value = response.data.data
        
        // Завантажити дані голосування
        await Promise.all([
          fetchVoteCount(),
          checkUserVote()
        ])
      }
    } catch (error) {
      console.error('Error fetching voting:', error)
    } finally {
      loading.value = false
    }
  }
  
  const fetchVoteCount = async () => {
    try {
      const response = await api.get(`/votes/voting/${route.params.id}`)
      if (response.data.success) {
        voteCount.value = response.data.count
      }
    } catch (error) {
      console.error('Error fetching vote count:', error)
    }
  }
  
  const checkUserVote = async () => {
    try {
      const response = await api.get(`/votes/voting/${route.params.id}`)
      if (response.data.success) {
        const userVote = response.data.data.find(
          (vote: any) => vote.user_id === authStore.user?.uid
        )
        userVoted.value = !!userVote
      }
    } catch (error) {
      console.error('Error checking user vote:', error)
    }
  }
  
  const handleVote = async () => {
    try {
      isVoting.value = true
      const response = await api.post('/votes', { voting_id: route.params.id })
      
      if (response.data.success) {
        await Promise.all([
          fetchVoteCount(),
          checkUserVote()
        ])
        
        const message = userVoted.value ? 'Голос скасовано!' : 'Голос записано!'
        alert(message)
      }
    } catch (error: any) {
      console.error('Error voting:', error)
      alert(error.response?.data?.error || 'Помилка при голосуванні')
    } finally {
      isVoting.value = false
    }
  }
  
  const getVoteButtonText = () => {
    if (isVoting.value) return 'Обробляємо...'
    return userVoted.value ? 'Скасувати голос' : 'Проголосувати'
  }
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-yellow-100 text-yellow-800'
      case 'deleted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активне'
      case 'closed': return 'Закрите'
      case 'deleted': return 'Видалене'
      default: return 'Невідомо'
    }
  }
  
  const formatDate = (date: string | Date) => {
    try {
      let dateObj: Date
      
      if (typeof date === 'string') {
        dateObj = new Date(date)
      } else if (date instanceof Date) {
        dateObj = date
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date((date as any).seconds * 1000)
      } else {
        return 'Невідомо'
      }
      
      return dateObj.toLocaleDateString('uk-UA')
    } catch (error) {
      return 'Невідомо'
    }
  }
  
  const editVoting = () => {
    router.push(`/votings/${route.params.id}/edit`)
  }
  
  const closeVoting = async () => {
    const resultText = prompt('Введіть результат голосування (необов\'язково):')
    
    try {
      const response = await api.put(`/votings/${route.params.id}/close`, {
        result_text: resultText || ''
      })
      
      if (response.data.success) {
        alert('Голосування закрито!')
        fetchVoting()
      }
    } catch (error: any) {
      console.error('Error closing voting:', error)
      alert(error.response?.data?.error || 'Помилка при закритті голосування')
    }
  }
  
  const deleteVoting = async () => {
    if (confirm('Ви впевнені, що хочете видалити це голосування?')) {
      try {
        const response = await api.delete(`/votings/${route.params.id}`)
        if (response.data.success) {
          alert('Голосування видалено!')
          router.push('/votings')
        }
      } catch (error: any) {
        console.error('Error deleting voting:', error)
        alert(error.response?.data?.error || 'Помилка при видаленні')
      }
    }
  }
  
  onMounted(() => {
    fetchVoting()
  })
  </script>