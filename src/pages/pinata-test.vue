<template>
  <div class="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-600 mb-6">Pinata API接続テスト</h1>
    
    <!-- API接続チェック -->
    <div class="mb-6 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">API接続チェック</h2>
      <button
        @click="testConnection"
        :disabled="isTesting"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
      >
        {{ isTesting ? 'テスト中...' : 'API接続をテスト' }}
      </button>
      
      <div v-if="connectionResult" class="mt-4 p-4 rounded-lg" :class="connectionResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
        <h3 class="font-semibold mb-2">{{ connectionResult.message }}</h3>
        <div v-if="!connectionResult.success" class="text-sm">
          <p><strong>エラー:</strong> {{ connectionResult.error }}</p>
        </div>
      </div>
    </div>

    <!-- JSONメタデータアップロードテスト -->
    <div class="mb-6 p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">JSONメタデータアップロードテスト</h2>
      
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
        class="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
      >
        {{ isJSONUploading ? 'アップロード中...' : 'JSONメタデータをアップロード' }}
      </button>
      
      <div v-if="jsonUploadResult" class="mt-4 p-4 rounded-lg" :class="jsonUploadResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
        <h3 class="font-semibold mb-2">{{ jsonUploadResult.message }}</h3>
        <div v-if="jsonUploadResult.success" class="text-sm">
          <p><strong>IPFS Hash:</strong> {{ jsonUploadResult.hash }}</p>
          <p><strong>URL:</strong> <a :href="jsonUploadResult.url" target="_blank" class="text-blue-600 hover:underline">{{ jsonUploadResult.url }}</a></p>
        </div>
        <div v-if="!jsonUploadResult.success" class="text-sm">
          <p><strong>エラー:</strong> {{ jsonUploadResult.error }}</p>
        </div>
      </div>
    </div>

    <!-- 環境変数チェック -->
    <div class="p-6 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">環境変数チェック</h2>
      <div class="text-sm">
        <p><strong>Pinata JWT Key:</strong> 
          <span v-if="pinataJWTKey" class="break-all text-green-700">
            設定済み (先頭5文字: {{ pinataJWTKey.substring(0, 5) }}...)
          </span>
          <span v-else class="text-red-600">
            未設定
          </span>
        </p>
        <p v-if="!pinataJWTKey" class="text-red-600 mt-2">
          .envファイルにPINATA_JWT_KEYを設定してください
        </p>
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/" class="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition">トップページへ</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkPinataConnection, uploadMetadataToPinata } from '~/lib/pinata'

// リアクティブ変数
const isTesting = ref(false)
const isJSONUploading = ref(false)
const connectionResult = ref<any>(null)
const jsonUploadResult = ref<any>(null)
const metadataJSON = ref('')

// 環境変数を取得
const config = useRuntimeConfig()
const pinataJWTKey = config.public.pinataJWTKey

// デフォルトのメタデータを設定
onMounted(() => {
  metadataJSON.value = JSON.stringify({
    name: "Sample NFT Metadata",
    description: "This is a sample NFT metadata for Pinata test.",
    image: "ipfs://QmTfN2B3jB92Y5B5d5B5d5B5d5B5d5B5d5B5d5B5d5", // サンプル画像URL（実際のIPFSハッシュに置き換えてください）
    attributes: [
      {
        trait_type: "Test",
        value: "Pinata"
      },
      {
        trait_type: "Version",
        value: "1.0"
      }
    ]
  }, null, 2)
})

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