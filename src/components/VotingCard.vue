<!-- filepath: /home/pirog/Projects/IdeaL/IdeaL-frontend/src/components/VotingCard.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow border">
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
    
    <div class="flex justify-between items-center mb-4">
      <div class="text-sm text-gray-600">
        Автор: {{ authorName || 'Завантаження...' }}
      </div>
      <div class="text-sm text-gray-600">
        Голосів: {{ voteCount }}
      </div>
    </div>
    
    <div class="flex space-x-2">
      <button 
        @click="handleVote"
        :disabled="isVoting"
        :class="userVoted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
        class="text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
      >
        {{ getVoteButtonText() }}
      </button>
      
      <button 
        @click="$emit('showDetails', voting.id)"
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
      >
        Детальніше
      </button>
      
      <button 
        v-if="canEdit"
        @click="$emit('editVoting', voting.id)"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Редагувати
      </button>
      
      <button 
        v-if="canDelete"
        @click="$emit('deleteVoting', voting.id)"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Видалити
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export interface Voting {
  id: string
  author_id: string
  title: string
  description: string
  created_at: string | Date
  tag: string
  status: 'active' | 'closed' | 'deleted'
  result_text?: string
}

interface Props {
  voting: Voting
  voteCount: number
  userVoted: boolean
}

interface Emits {
  (event: 'vote', votingId: string): void
  (event: 'showDetails', votingId: string): void
  (event: 'editVoting', votingId: string): void
  (event: 'deleteVoting', votingId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const isVoting = ref(false)
const authorName = ref<string>('')

const canEdit = computed(() => {
  return authStore.user?.uid === props.voting.author_id || authStore.isAdmin
})

const canDelete = computed(() => {
  return authStore.user?.uid === props.voting.author_id || authStore.isAdmin
})

const handleVote = async () => {
  isVoting.value = true
  try {
    emit('vote', props.voting.id)
  } finally {
    isVoting.value = false
  }
}

const getVoteButtonText = () => {
  if (isVoting.value) return 'Обробляємо...'
  return props.userVoted ? 'Скасувати голос' : 'Проголосувати'
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

const fetchAuthorName = async () => {
  try {
    const response = await api.get(`/users/${props.voting.author_id}`)
    if (response.data.success) {
      authorName.value = response.data.data.name || response.data.data.username
    }
  } catch (error) {
    console.error('Error fetching author name:', error)
    authorName.value = 'Невідомий автор'
  }
}

onMounted(() => {
  fetchAuthorName()
})
</script>