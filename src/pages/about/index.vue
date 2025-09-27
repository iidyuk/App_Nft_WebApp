<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-green-600 mb-4">Registration</h1>
    
    <!-- ステップ表示 -->
    <div class="mb-6 flex justify-center space-x-4">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
        <span class="ml-2 text-sm text-gray-600">画像アップロード</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" :class="uploadedImageInfo ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'">2</div>
        <span class="ml-2 text-sm" :class="uploadedImageInfo ? 'text-gray-800' : 'text-gray-400'">メタデータ作成</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" :class="metadataUploadResult?.success ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500'">3</div>
        <span class="ml-2 text-sm" :class="metadataUploadResult?.success ? 'text-gray-800' : 'text-gray-400'">NFT発行</span>
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
    </div>

    <!-- Step 2: メタデータアップロードコンポーネント（画像アップロード完了後に表示） -->
    <MetadataUploader 
      v-if="uploadedImageInfo"
      :uploaded-image-info="uploadedImageInfo"
      :auto-upload="false"
      @metadata-uploaded="handleMetadataUploaded"
    />

    <!-- Step 3: NFT発行コンポーネント（メタデータアップロード完了後に表示） -->
    <NFTMinter v-if="metadataUploadResult?.success" :metadata-url="metadataUploadResult.url" />

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">Top Page</NuxtLink>
  </div>
</template>

<script setup lang="ts">

  import { ref } from 'vue'
  import ImageSelector from './components/ImageSelector.vue'
  import MetadataUploader from './components/MetadataUploader.vue' // MetadataUploaderコンポーネントをインポート
  import NFTMinter from './components/NFTMinter.vue' // NFTMinterコンポーネントをインポート

  // ref() 変数の定義
  const selectedFile = ref<File | null>(null)  // 画像ファイル
  const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
  const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像のURL(spabase)
  const metadataUploadResult = ref<any>(null)  // メタデータアップロードの結果

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

  // メタデータアップロード完了時の処理
  const handleMetadataUploaded = (result: any) => {
    metadataUploadResult.value = result
    console.log('メタデータアップロード結果:', result)
  }

  // 環境変数のテスト
  const config = useRuntimeConfig()
  console.log(' runtimeConfig.public ')
  console.log('supabaseUrl:', config.public.supabaseUrl)
  console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>