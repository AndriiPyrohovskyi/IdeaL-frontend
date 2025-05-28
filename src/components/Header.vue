<template>
  <header class="bg-blue-500 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        <RouterLink to="/" class="hover:text-blue-200">IdeaL</RouterLink>
      </h1>
      
      <nav>
        <ul class="flex space-x-4 items-center">
          <li><RouterLink to="/" class="hover:text-blue-200">Головна</RouterLink></li>
          
          <li v-if="authStore.isAuthenticated">
            <RouterLink to="/votings" class="hover:text-blue-200">Голосування</RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated" class="relative">
            <button 
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 hover:text-blue-200 focus:outline-none"
            >
              <div class="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                {{ userInitials }}
              </div>
              <span>{{ authStore.user?.name }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div 
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <RouterLink 
                to="/profile" 
                @click="showProfileMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Мій профіль
              </RouterLink>
              <RouterLink 
                to="/profile/votings" 
                @click="showProfileMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Мої голосування
              </RouterLink>
              <RouterLink 
                to="/profile/votes" 
                @click="showProfileMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Мої голоси
              </RouterLink>
              <hr class="my-1">
              <button 
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Вихід
              </button>
            </div>
          </li>
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="hover:text-blue-200">Вхід</RouterLink>
          </li>
          
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" class="hover:text-blue-200">Реєстрація</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
    <div 
      v-if="showProfileMenu"
      @click="showProfileMenu = false"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showProfileMenu = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const handleLogout = async () => {
  showProfileMenu.value = false
  await authStore.logout()
  router.push('/')
}

// Закрити меню при кліку Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>
