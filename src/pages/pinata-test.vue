<template>
  <div class="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold text-green-600 mb-6">Pinata API Connection Test</h1>
    
    <!-- API接続チェック -->
    <div class="mb-6 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">API Connection Check</h2>
      <button
        @click="testConnection"
        :disabled="isTesting"
        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
      >
        {{ isTesting ? 'Testing...' : 'Test API Connection' }}
      </button>
      
      <div v-if="connectionResult" class="mt-4 p-4 rounded-lg" :class="connectionResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
        <h3 class="font-semibold mb-2">{{ connectionResult.message }}</h3>
        <div v-if="!connectionResult.success" class="text-sm">
          <p><strong>Error:</strong> {{ connectionResult.error }}</p>
        </div>
      </div>
    </div>

    <!-- JSONメタデータアップロードテスト -->
    <div class="mb-6 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">JSON Metadata Upload Test</h2>
      
      <div class="mb-4">
        <textarea
          v-model="metadataJSON"
          class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
          placeholder="JSONメタデータを入力してください..."
        ></textarea>
      </div>
      
      <button
        @click="testJSONUpload"
        :disabled="isJSONUploading || !metadataJSON"
        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
      >
        {{ isJSONUploading ? 'Uploading...' : 'Upload JSON Metadata' }}
      </button>
      
      <div v-if="jsonUploadResult" class="mt-4 p-4 rounded-lg" :class="jsonUploadResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
        <h3 class="font-semibold mb-2">{{ jsonUploadResult.message }}</h3>
        <div v-if="jsonUploadResult.success" class="text-sm">
          <p><strong>IPFS Hash:</strong> {{ jsonUploadResult.hash }}</p>
          <p><strong>URL:</strong> <a :href="jsonUploadResult.url" target="_blank" class="text-green-600 hover:underline">{{ jsonUploadResult.url }}</a></p>
        </div>
        <div v-if="!jsonUploadResult.success" class="text-sm">
          <p><strong>エラー:</strong> {{ jsonUploadResult.error }}</p>
        </div>
      </div>
    </div>

    <!-- 環境変数チェック -->
    <div class="p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Environment Variable Check</h2>
      <div class="text-sm">
        <p><strong>Pinata JWT Key:</strong> 
          <span v-if="pinataJWTKey" class="break-all text-green-700">
            設定済み (First 5 characters: {{ pinataJWTKey.substring(0, 5) }}...)
          </span>
          <span v-else class="text-red-600">
            未設定
          </span>
        </p>
        <p v-if="!pinataJWTKey" class="text-red-600 mt-2">
          PINATA_JWT_KEYを設定してください
        </p>
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">トップページへ</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkPinataConnection, uploadMetadataToPinata } from '~/lib/external/pinata'

// リアクティブ変数
const isTesting = ref(false)
const isJSONUploading = ref(false)
const connectionResult = ref<any>(null)
const jsonUploadResult = ref<any>(null)
const metadataJSON = ref(`{
  "name": "Sample NFT Metadata",
  "description": "This is a sample NFT metadata for Pinata test.",
  "image": "ipfs://QmTfN2B3jB92Y5B5d5B5d5B5d5B5d5B5d5B5d5B5d5"
}`)

// 環境変数を取得
const config = useRuntimeConfig()
const pinataJWTKey = config.public.pinataJWTKey

// API接続テスト
const testConnection = async () => {
  isTesting.value = true
  connectionResult.value = null
  
  try {
    const result = await checkPinataConnection()
    connectionResult.value = result
  } catch (error) {
    connectionResult.value = {
      success: false,
      message: 'API接続テストでエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isTesting.value = false
  }
}

// JSONメタデータアップロードテスト
const testJSONUpload = async () => {
  if (!metadataJSON.value) return
  
  isJSONUploading.value = true
  jsonUploadResult.value = null
  
  try {
    const metadata = JSON.parse(metadataJSON.value)
    const result = await uploadMetadataToPinata(metadata)
    jsonUploadResult.value = result
  } catch (error) {
    jsonUploadResult.value = {
      success: false,
      message: 'JSONメタデータアップロードテストでエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isJSONUploading.value = false
  }
}
</script> 