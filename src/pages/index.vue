<template>
  <div class="max-w-lg mx-auto mt-20 p-8 text-center">
    <h1 class="text-3xl font-bold mb-4">nft app</h1>
    <p class="mb-6 text-gray-700">Let's make NFTs from images.</p>
      
    <div class="space-y-4">
      <NuxtLink 
        to="/registration" 
        class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
      >
        Registration
      </NuxtLink>
      <br>
      <NuxtLink 
        to="/list" 
        class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
      >
        List
      </NuxtLink>
      <br>
      <NuxtLink to="/pinata-test" class="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition">Pinata API Test..</NuxtLink>
    </div>

    <!-- 認証状態の表示 -->
    <div v-if="loading" class="mt-8 mb-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
    <div v-else-if="isAuthenticated" class="mb-6">
      <!-- <p class="text-green-600 font-semibold">ログイン中: {{ user?.email }}</p> -->
    </div>

  </div>
</template>

<script setup lang="ts">
// 認証が必要なページとして設定
definePageMeta({
  middleware: 'auth'
})

// 認証機能の使用
const { user, loading, isAuthenticated, initAuth } = useAuth()

// 認証を初期化
onMounted(async () => {
  await initAuth()
  console.log('Auth state after init:', { user: user.value, isAuthenticated: isAuthenticated.value })
})
</script>