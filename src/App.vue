<template>
  <div v-if="authStore.loading && !authStore.isInitialized" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Завантаження...</p>
    </div>
  </div>
  
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
})
</script>

<style scoped>
</style>
