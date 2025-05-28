<!-- filepath: /home/pirog/Projects/IdeaL/IdeaL-frontend/src/views/UserVotesView.vue -->
<template>
  <main>
    <Header />
    
    <div class="container mx-auto py-8 px-4">
      <div class="flex items-center mb-6">
        <button 
          @click="$router.go(-1)"
          class="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Назад
        </button>
        <h2 class="text-3xl font-bold">Мої голоси</h2>
      </div>
      
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Завантаження...</p>
      </div>
      
      <div v-else-if="userVotes.length === 0" class="text-center text-gray-600">
        <p class="text-xl mb-4">Ви ще не голосували</p>
        <RouterLink 
          to="/votings"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Переглянути голосування
        </RouterLink>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="vote in userVotes" 
          :key="vote.id"
          class="bg-white p-6 rounded-lg shadow border"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-2">{{ vote.voting?.title || 'Завантаження...' }}</h3>
              <p class="text-gray-600 mb-2">{{ vote.voting?.description || '' }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>Голосували: {{ formatDate(vote.voted_at) }}</span>
                <span v-if="vote.voting?.tag" class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ vote.voting.tag }}
                </span>
                <span v-if="vote.voting?.status" 
                      :class="getStatusClass(vote.voting.status)"
                      class="px-2 py-1 rounded text-xs">
                  {{ getStatusText(vote.voting.status) }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <button
                @click="viewVoting(vote.voting_id)"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Переглянути
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const userVotes = ref<any[]>([])
const loading = ref(true)

const fetchUserVotes = async () => {
  try {
    // Використовуємо новий роут для отримання голосів користувача
    const votesResponse = await api.get(`/votes/user/${authStore.user?.uid}`)
    
    if (votesResponse.data.success) {
      const votes = votesResponse.data.data
      
      // Завантажити дані про голосування для кожного голосу
      for (const vote of votes) {
        try {
          const votingResponse = await api.get(`/votings/${vote.voting_id}`)
          if (votingResponse.data.success) {
            vote.voting = votingResponse.data.data
          }
        } catch (error) {
          console.error(`Error fetching voting ${vote.voting_id}:`, error)
          // Додаємо заглушку якщо голосування не знайдено
          vote.voting = {
            title: 'Голосування видалено або недоступне',
            description: '',
            tag: '',
            status: 'deleted'
          }
        }
      }
      
      userVotes.value = votes
    }
  } catch (error) {
    console.error('Error fetching user votes:', error)
  } finally {
    loading.value = false
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
      // Firestore Timestamp
      dateObj = new Date((date as any).seconds * 1000)
    } else {
      return 'Невідомо'
    }
    
    return dateObj.toLocaleDateString('uk-UA')
  } catch (error) {
    return 'Невідомо'
  }
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

const viewVoting = (votingId: string) => {
  router.push(`/votings/${votingId}`)
}

onMounted(() => {
  fetchUserVotes()
})
</script>