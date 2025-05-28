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
          <h2 class="text-3xl font-bold">Мої голосування</h2>
        </div>
        
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Завантаження...</p>
        </div>
        
        <div v-else-if="votings.length === 0" class="text-center text-gray-600">
          <p class="text-xl mb-4">У вас поки немає створених голосувань</p>
          <RouterLink 
            to="/votings/create"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Створити перше голосування
          </RouterLink>
        </div>
        
        <div v-else class="grid gap-4">
          <VotingCard
            v-for="voting in votings"
            :key="voting.id"
            :voting="voting"
            :vote-count="votesCounts[voting.id] || 0"
            :user-voted="false"
            @vote="() => {}"
            @show-details="showVotingDetails"
            @edit-voting="editVoting"
            @delete-voting="deleteVoting"
          />
        </div>
      </div>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import Header from '@/components/Header.vue'
  import VotingCard, { type Voting } from '@/components/VotingCard.vue'
  import { useAuthStore } from '@/stores/auth'
  import api from '@/services/api'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const votings = ref<Voting[]>([])
  const loading = ref(true)
  const votesCounts = reactive<Record<string, number>>({})
  
  const fetchUserVotings = async () => {
    try {
      const response = await api.get(`/votings/user/${authStore.user?.uid}`)
      if (response.data.success) {
        votings.value = response.data.data
        
        // Завантажити кількість голосів для кожного голосування
        for (const voting of votings.value) {
          await fetchVoteCount(voting.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user votings:', error)
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
  
  const showVotingDetails = (votingId: string) => {
    router.push(`/votings/${votingId}`)
  }
  
  const editVoting = (votingId: string) => {
    router.push(`/votings/${votingId}/edit`)
  }
  
  const deleteVoting = async (votingId: string) => {
    if (confirm('Ви впевнені, що хочете видалити це голосування?')) {
      try {
        const response = await api.delete(`/votings/${votingId}`)
        if (response.data.success) {
          alert('Голосування видалено!')
          fetchUserVotings() // Перезавантажити список
        }
      } catch (error: any) {
        console.error('Error deleting voting:', error)
        alert(error.response?.data?.error || 'Помилка при видаленні')
      }
    }
  }
  
  onMounted(() => {
    fetchUserVotings()
  })
  </script>