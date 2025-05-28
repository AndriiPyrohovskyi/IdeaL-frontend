<template>
  <main>
    <Header />
    
    <div class="container mx-auto py-8 px-4">
      <h2 class="text-3xl font-bold mb-6">Мій профіль</h2>
      
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Завантаження...</p>
      </div>
      
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Інформація про користувача -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="text-center mb-4">
              <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {{ userInitials }}
              </div>
              <h3 class="text-xl font-semibold">{{ user?.name }}</h3>
              <p class="text-gray-600">@{{ user?.username }}</p>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
            </div>
            
            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Статус:</span>
                <span :class="getStatusClass(user?.status)">
                  {{ getStatusText(user?.status) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Дата реєстрації:</span>
                <span>{{ formatDate(user?.created_at) }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Роль:</span>
                <span class="capitalize">{{ user?.role || 'user' }}</span>
              </div>
            </div>
            
            <button
              @click="showEditForm = true"
              class="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Редагувати профіль
            </button>
          </div>
        </div>
        
        <!-- Статистика -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow text-center">
              <div class="text-2xl font-bold text-blue-500">{{ stats.votingsCount }}</div>
              <div class="text-gray-600">Створених голосувань</div>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow text-center">
              <div class="text-2xl font-bold text-green-500">{{ stats.votesCount }}</div>
              <div class="text-gray-600">Голосів віддано</div>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow text-center">
              <div class="text-2xl font-bold text-purple-500">{{ stats.totalVotesReceived }}</div>
              <div class="text-gray-600">Голосів отримано</div>
            </div>
          </div>
          
          <!-- Швидкі дії -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h4 class="text-lg font-semibold mb-4">Швидкі дії</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RouterLink 
                to="/votings/create"
                class="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                  +
                </div>
                <div>
                  <div class="font-medium">Створити голосування</div>
                  <div class="text-sm text-gray-600">Запропонувати нову ідею</div>
                </div>
              </RouterLink>
              
              <button
                @click="$router.push('/votings')"
                class="flex items-center p-4 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white mr-3">
                  🗳️
                </div>
                <div>
                  <div class="font-medium">Активні голосування</div>
                  <div class="text-sm text-gray-600">Взяти участь</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const loading = ref(true)
const showEditForm = ref(false)
const user = ref<any>(null)
const stats = ref({
  votingsCount: 0,
  votesCount: 0,
  totalVotesReceived: 0
})

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-600'
    case 'banned': return 'text-red-600'
    case 'inactive': return 'text-yellow-600'
    default: return 'text-gray-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Активний'
    case 'banned': return 'Заблокований'
    case 'inactive': return 'Неактивний'
    default: return 'Невідомо'
  }
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'Невідомо'
  
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
    
    // Перевірити чи дата валідна
    if (isNaN(dateObj.getTime())) {
      return 'Невідомо'
    }
    
    return dateObj.toLocaleDateString('uk-UA')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Невідомо'
  }
}

const fetchUserData = async () => {
  try {
    const response = await api.get('/users/me')
    if (response.data.success) {
      user.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

const fetchStats = async () => {
  try {
    // Отримати кількість створених голосувань
    const votingsResponse = await api.get(`/votings/user/${authStore.user?.uid}`)
    if (votingsResponse.data.success) {
      stats.value.votingsCount = votingsResponse.data.count
      
      // Підрахувати загальну кількість голосів за голосування користувача
      let totalVotesReceived = 0
      for (const voting of votingsResponse.data.data) {
        try {
          const votingVotesResponse = await api.get(`/votes/voting/${voting.id}`)
          if (votingVotesResponse.data.success) {
            totalVotesReceived += votingVotesResponse.data.count
          }
        } catch (error) {
          console.error('Error fetching votes for voting:', voting.id, error)
        }
      }
      stats.value.totalVotesReceived = totalVotesReceived
    }

    // Отримати кількість голосів користувача
    try {
      const votesResponse = await api.get('/votes')
      if (votesResponse.data.success) {
        const userVotes = votesResponse.data.data?.filter(
          (vote: any) => vote.user_id === authStore.user?.uid
        ) || []
        stats.value.votesCount = userVotes.length
      }
    } catch (error) {
      console.error('Error fetching user votes:', error)
      stats.value.votesCount = 0
    }

  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchUserData(),
    fetchStats()
  ])
  loading.value = false
})
</script>