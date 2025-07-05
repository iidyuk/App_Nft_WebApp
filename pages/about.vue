<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-green-600 mb-4">About ページ</h1>
    <p class="mb-6 text-gray-700">ここに好きな内容を書けます。</p>
    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">トップページへ</NuxtLink>
  </div>
</template>

<script setup lang="ts">

// 環境変数のテスト
const config = useRuntimeConfig()
console.log(' runtimeConfig.public ')
console.log('supabaseUrl:', config.public.supabaseUrl)
console.log('supabaseAnonKey:', config.public.supabaseAnonKey)



// ここにロジック（変数、関数、API呼び出しなど）を記述
</script>