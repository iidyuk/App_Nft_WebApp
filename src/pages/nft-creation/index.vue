<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-purple-600 mb-4">NFT作成</h1>
    
    <!-- ステップ表示 -->
    <div class="mb-6 flex justify-center space-x-4">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
        <span class="ml-2 text-sm text-green-600">画像アップロード完了</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" :class="metadataUploadResult?.success ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'">2</div>
        <span class="ml-2 text-sm" :class="metadataUploadResult?.success ? 'text-gray-800' : 'text-gray-600'">メタデータ作成</span>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" :class="metadataUploadResult?.success ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500'">3</div>
        <span class="ml-2 text-sm" :class="metadataUploadResult?.success ? 'text-gray-800' : 'text-gray-400'">NFT発行</span>
      </div>
    </div>

    <!-- 画像アップロード完了情報の表示 -->
    <div v-if="uploadedImageInfo" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 class="text-lg font-medium text-green-800 mb-2">画像アップロード完了</h3>
      <p class="text-sm text-green-600 mb-2">ファイル名: {{ uploadedImageInfo.fileName }}</p>
      <p class="text-xs text-green-500 break-all">URL: {{ uploadedImageInfo.url }}</p>
    </div>

    <!-- Step 2: メタデータアップロードコンポーネント -->
    <MetadataUploader 
      v-if="uploadedImageInfo"
      :uploaded-image-info="uploadedImageInfo"
      :auto-upload="false"
      @metadata-uploaded="handleMetadataUploaded"
    />

    <!-- Step 3: NFT発行コンポーネント（メタデータアップロード完了後に表示） -->
    <NFTMinter v-if="metadataUploadResult?.success" :metadata-url="metadataUploadResult.url" />

    <!-- ナビゲーションボタン -->
    <div class="mt-8 space-x-4">
      <NuxtLink 
        to="/about" 
        class="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition"
      >
        画像アップロードに戻る
      </NuxtLink>
      <NuxtLink 
        to="/" 
        class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
      >
        Top Page
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetadataUploader from './components/MetadataUploader.vue'
import NFTMinter from './components/NFTMinter.vue'

// クエリパラメータから画像情報を取得
const route = useRoute()

const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)
const metadataUploadResult = ref<any>(null)

// メタデータアップロード完了時の処理
const handleMetadataUploaded = (result: any) => {
  metadataUploadResult.value = result
  console.log('メタデータアップロード結果:', result)
}

// ページマウント時にクエリパラメータから画像情報を復元
onMounted(() => {
  const imageUrl = route.query.imageUrl as string
  const fileName = route.query.fileName as string
  
  if (imageUrl && fileName) {
    uploadedImageInfo.value = {
      url: decodeURIComponent(imageUrl),
      fileName: decodeURIComponent(fileName)
    }
  } else {
    // 画像情報がない場合はaboutページにリダイレクト
    navigateTo('/about')
  }
})
</script>
