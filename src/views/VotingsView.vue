<template>
  <main>
    <Header />
    
    <div class="container mx-auto py-8 px-4">
      <h2 class="text-3xl font-bold mb-6">Активні голосування</h2>
      
      <div v-if="loading" class="text-center">
        Завантаження...
      </div>
      
      <div v-else-if="votings.length === 0" class="text-center text-gray-600">
        Наразі немає активних голосувань
      </div>
      
      <div v-else class="grid gap-4">
        <div 
          v-for="voting in votings" 
          :key="voting.id"
          class="bg-white p-6 rounded-lg shadow border"
        >
          <h3 class="text-xl font-semibold mb-2">{{ voting.title }}</h3>
          <p class="text-gray-600 mb-4">{{ voting.description }}</p>
          <div class="flex justify-between items-center mb-4">
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {{ voting.tag }}
            </span>
            <span class="text-sm text-gray-500">
              {{ formatDate(voting.created_at) }}
            </span>
          </div>
          
          <!-- Додати кнопки голосування -->
          <div class="flex space-x-2">
            <button 
              @click="vote(voting.id)"
              :disabled="isVoting"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {{ isVoting ? 'Голосуємо...' : 'Проголосувати' }}
            </button>
            
            <button 
              @click="showVotes(voting.id)"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Результати
            </button>
          </div>
          
          <!-- Показати кількість голосів -->
          <div v-if="votesCounts[voting.id]" class="mt-2 text-sm text-gray-600">
            Голосів: {{ votesCounts[voting.id] }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import Header from '@/components/Header.vue'
import api from '@/services/api'
interface Voting {
  id: string
  author_id: string
  title: string
  description: string
  created_at: string | Date
  tag: string
  status: 'active' | 'closed' | 'deleted'
  result_text?: string
}

const votings = ref<Voting[]>([])
const loading = ref(true)
const isVoting = ref(false)
const votesCounts = reactive<Record<string, number>>({})

const fetchVotings = async () => {
  try {
    const response = await api.get('/votings/public')
    if (response.data.success) {
      votings.value = response.data.data
      for (const voting of votings.value) {
        await fetchVoteCount(voting.id)
      }
    }
  } catch (error) {
    console.error('Error fetching votings:', error)
  } finally {
    loading.value = false
  }
}

const fetchVoteCount = async (votingId: string) => {
  try {
    const response = await api.get(`/votes/voting/${votingId}`)
    if (response.data.success) {
      votesCounts[votingId] = response.data.count
    }
  } catch (error) {
    console.error('Error fetching vote count:', error)
  }
}

const vote = async (votingId: string) => {
  try {
    isVoting.value = true
    const response = await api.post('/votes', { voting_id: votingId })
    
    if (response.data.success) {
      await fetchVoteCount(votingId)
      alert(response.data.message)
    }
  } catch (error: any) {
    console.error('Error voting:', error)
    alert(error.response?.data?.error || 'Помилка при голосуванні')
  } finally {
    isVoting.value = false
  }
}

const showVotes = async (votingId: string) => {
  try {
    const response = await api.get(`/votes/voting/${votingId}`)
    if (response.data.success) {
      alert(`Кількість голосів: ${response.data.count}`)
    }
  } catch (error) {
    console.error('Error fetching votes:', error)
  }
}

const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString()
  }
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchVotings()
})
</script>