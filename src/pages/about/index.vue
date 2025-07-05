<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-green-600 mb-4">About ページ</h1>

    <!-- 画像選択コンポーネント -->
    <ImageSelector 
      @image-selected="handleImageSelected" 
      @image-uploaded="handleImageUploaded" 
    />

    <!-- アップロード完了情報の表示 -->
    <div v-if="uploadedImageInfo" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-lg font-medium text-blue-800 mb-2">アップロード完了</h3>
      <p class="text-sm text-blue-600 mb-2">ファイル名: {{ uploadedImageInfo.fileName }}</p>
      <p class="text-xs text-blue-500 break-all">URL: {{ uploadedImageInfo.url }}</p>
    </div>

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition">トップページへ</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// ImageSelectorコンポーネントを明示的にインポート
import ImageSelector from './components/ImageSelector.vue'

// 選択された画像の情報を管理
const selectedFile = ref<File | null>(null)
const selectedImageUrl = ref<string>('')
const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)

// 画像選択時の処理
const handleImageSelected = (file: File, imageUrl: string) => {
  selectedFile.value = file
  selectedImageUrl.value = imageUrl
  console.log('選択されたファイル:', file.name)
  console.log('ファイルサイズ:', file.size, 'bytes')
}

// 画像アップロード完了時の処理
const handleImageUploaded = (url: string, fileName: string) => {
  uploadedImageInfo.value = { url, fileName }
  console.log('アップロード完了:', fileName)
  console.log('アップロードURL:', url)
}

// 環境変数のテスト
// const config = useRuntimeConfig()
// console.log(' runtimeConfig.public ')
// console.log('supabaseUrl:', config.public.supabaseUrl)
// console.log('supabaseAnonKey:', config.public.supabaseAnonKey)

// ここにロジック（変数、関数、API呼び出しなど）を記述
</script>