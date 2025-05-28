<script setup lang="ts">
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <main>
    <Header />
    
    <div class="container mx-auto py-8 px-4">
      <div v-if="authStore.isAuthenticated" class="text-center">
        <h2 class="text-3xl font-bold mb-4">Ласкаво просимо, {{ authStore.user?.name }}!</h2>
        <p class="text-gray-600 mb-6">Ви увійшли в систему голосування IdeaL</p>
        
        <div class="space-x-4">
          <RouterLink 
            to="/votings" 
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Переглянути голосування
          </RouterLink>
        </div>
      </div>
      
      <div v-else class="text-center">
        <h2 class="text-3xl font-bold mb-4">Ласкаво просимо до IdeaL!</h2>
        <p class="text-gray-600 mb-6">Система онлайн голосування</p>
        
        <div class="space-x-4">
          <RouterLink 
            to="/login" 
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Увійти
          </RouterLink>
          <RouterLink 
            to="/register" 
            class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Зареєструватися
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
