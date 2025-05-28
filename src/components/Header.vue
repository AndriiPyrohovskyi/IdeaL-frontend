<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="bg-blue-500 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        <RouterLink to="/">IdeaL</RouterLink>
      </h1>
      
      <nav>
        <ul class="flex space-x-4 items-center">
          <li><RouterLink to="/" class="hover:text-blue-200">Головна</RouterLink></li>
          
          <li v-if="authStore.isAuthenticated">
            <RouterLink to="/votings" class="hover:text-blue-200">Голосування</RouterLink>
          </li>
          
          <li v-if="authStore.isAuthenticated" class="text-blue-200">
            Привіт, {{ authStore.user?.name }}!
          </li>
          
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="hover:text-blue-200">Вхід</RouterLink>
          </li>
          
          <li v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" class="hover:text-blue-200">Реєстрація</RouterLink>
          </li>
          
          <li v-if="authStore.isAuthenticated">
            <button 
              @click="handleLogout"
              class="hover:text-blue-200 bg-transparent border-none cursor-pointer"
            >
              Вихід
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
