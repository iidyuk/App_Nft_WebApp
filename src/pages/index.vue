<template>
  <div class="max-w-lg mx-auto mt-20 p-8 text-center">
    <h1 class="text-3xl font-bold text-green-600 mb-4">nft</h1>
    <p class="mb-6 text-gray-700">Let's make NFT from jpg/jpeg file.</p>
    <div class="space-y-4">
      <NuxtLink to="/about" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">Registration</NuxtLink>
      <br>
      <NuxtLink to="/list" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition">List</NuxtLink>
      <br>
      <NuxtLink to="/pinata-test" class="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition">Pinata API Test</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// ここにロジック（変数、関数、API呼び出しなど）を記述
</script>