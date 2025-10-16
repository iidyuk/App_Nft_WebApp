<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-transparent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-end items-center h-16">
          <!-- ユーザー情報とログアウトボタン -->
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <button 
              @click="handleLogout"
              class="text-sm text-green-600 hover:text-green-800 underline"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- メインコンテンツ -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// 認証機能の使用
const { user, isAuthenticated, signOut, initAuth } = useAuth()

// 認証を初期化
onMounted(async () => {
  await initAuth()
})

// ログアウト処理
const handleLogout = async () => {
  const { error } = await signOut()
  if (error) {
    console.error('Logout error:', error)
  }
}
</script>