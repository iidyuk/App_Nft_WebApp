<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-green-600 mb-4">画像アップロード</h1>
    
    <!-- ステップ表示 -->
    <div class="mb-6 flex justify-center space-x-4">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
        <span class="ml-2 text-sm text-gray-600">画像アップロード</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
        <span class="ml-2 text-sm text-gray-400">メタデータ作成</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
        <span class="ml-2 text-sm text-gray-400">NFT発行</span>
      </div>
    </div>

    <!-- Step 1: 画像選択コンポーネント -->
    <ImageSelector 
      @image-selected="handleImageSelected" 
      @image-uploaded="handleImageUploaded" 
    />

    <!-- アップロード完了情報の表示 -->
    <div v-if="uploadedImageInfo" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-lg font-medium text-blue-800 mb-2">画像アップロード完了</h3>
      <p class="text-sm text-blue-600 mb-2">ファイル名: {{ uploadedImageInfo.fileName }}</p>
      <p class="text-xs text-blue-500 break-all">URL: {{ uploadedImageInfo.url }}</p>
      
      <!-- NFT作成ページへの遷移ボタン -->
      <div class="mt-4">
        <NuxtLink 
          :to="`/nft-creation?imageUrl=${encodeURIComponent(uploadedImageInfo.url)}&fileName=${encodeURIComponent(uploadedImageInfo.fileName)}`"
          class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          次のステップ: NFTを作成する
        </NuxtLink>
      </div>
    </div>

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">Top Page</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageSelector from './components/ImageSelector.vue'

// ref() 変数の定義
const selectedFile = ref<File | null>(null)  // 画像ファイル
const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像のURL(supabase)

//// 関数定義
// 画像選択時の処理
const handleImageSelected = (file: File, imageUrl: string) => {
  selectedFile.value = file
  selectedImageUrl.value = imageUrl
  console.log('選択されたファイル:', file.name)
  console.log('ファイルサイズ:', file.size, 'bytes')
}

// 画像アップロード完了時の処理
const handleImageUploaded = (url: string, fileName: string) => {
  uploadedImageInfo.value = { url, fileName }  // アップロード済みの画像情報
  console.log('画像アップロード完了:', fileName)
  console.log('画像アップロードURL:', url)
}

// 環境変数のテスト
const config = useRuntimeConfig()
console.log(' runtimeConfig.public ')
console.log('supabaseUrl:', config.public.supabaseUrl)
console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>