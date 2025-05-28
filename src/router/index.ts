import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register', 
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/votings',
      name: 'votings',
      component: () => import('../views/VotingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/votings/create',
      name: 'create-voting',
      component: () => import('../views/CreateVotingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/votings/:id',
      name: 'voting-details',
      component: () => import('./../views/VotingDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/votings/:id/edit',
      name: 'edit-voting',
      component: () => import('././../views/EditVotingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/votings',
      name: 'user-votings',
      component: () => import('./../views/UserVotingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/votes',
      name: 'user-votes',
      component: () => import('./../views/UserVotesView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// Гарди маршрутів з правильною ініціалізацією
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Дочекатися ініціалізації автентифікації
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  // Перевірка на необхідність автентифікації
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Перевірка для гостьових сторінок (логін/реєстрація)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
