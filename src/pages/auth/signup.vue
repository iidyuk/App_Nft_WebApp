<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create new account
        </h2>

      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password（6文字以上）"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Password Confirm</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password Confirm"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="text-green-600 text-sm text-center">
          {{ successMessage }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Signing Up...' : 'Sign Up' }}
          </button>
        </div>

        <div class="text-center">
          <NuxtLink to="/auth/signin" class="font-medium text-green-600 hover:text-green-500">
            Sign In Now
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 認証機能の使用
const { signUp } = useAuth()

// フォームの状態
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// バリデーション
const validateForm = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'すべての項目を入力してください'
    return false
  }

  if (password.value.length < 6) {
    errorMessage.value = 'パスワードは6文字以上で入力してください'
    return false
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'パスワードが一致しません'
    return false
  }

  return true
}

// アカウント作成処理
const handleSignup = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  if (!validateForm()) {
    isLoading.value = false
    return
  }

  const { data, error } = await signUp(email.value, password.value)
  
  if (error) {
    errorMessage.value = 'アカウント作成に失敗しました。'
    console.error('Signup error:', error)
    isLoading.value = false
  } else {
    successMessage.value = 'アカウントが作成されました！'
    // フォームをリセット
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    // 1秒後にサインインページに自動転送（フラグ付き）
    setTimeout(() => {
      navigateTo('/auth/signin?from=signup')
    }, 1000)
  }
  
  if (!error) {
    isLoading.value = false
  }
}

// ページのメタ情報
definePageMeta({
  layout: false
})
</script>
