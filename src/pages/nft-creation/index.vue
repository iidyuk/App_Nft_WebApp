<template>
  <div class="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow text-center">
    <h1 class="text-3xl font-bold text-purple-600 mb-4">NFT作成</h1>
    
    <!-- アップロード済み画像の表示 -->
    <div v-if="uploadedImageInfo" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 class="text-lg font-medium text-green-800 mb-4">アップロード済み画像</h3>
      <div class="flex flex-col items-center">
        <img
          :src="uploadedImageInfo.url"
          :alt="uploadedImageInfo.fileName"
          class="rounded-lg shadow-md object-contain mb-3"
          style="width: 20vw; min-width: 200px; max-width: 300px; max-height: 200px;"
        />
        <p class="text-sm text-green-600 mb-1">ファイル名: {{ uploadedImageInfo.fileName }}</p>
        <!-- <p class="text-xs text-green-500 break-all text-center">URL: {{ uploadedImageInfo.url }}</p> -->
      </div>
    </div>

    <!-- Step 2: メタデータアップロードのコンポーネント -->
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
        to="/registration" 
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
  // import MetadataUploader from './components/MetadataUploader.vue'
  // import NFTMinter from './components/NFTMinter.vue'

  // クエリパラメータから画像情報を取得
  const route = useRoute()

  const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像情報
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
      navigateTo('/registration')
    }
  })
</script>
