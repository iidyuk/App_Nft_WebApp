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
      <h3 class="text-lg font-medium text-blue-800 mb-2">画像アップロード完了</h3>
      <p class="text-sm text-blue-600 mb-2">ファイル名: {{ uploadedImageInfo.fileName }}</p>
      <p class="text-xs text-blue-500 break-all">URL: {{ uploadedImageInfo.url }}</p>
    </div>

    <!-- メタデータアップロード情報の表示 -->
    <div v-if="metadataUploadResult" class="mt-6 p-4 rounded-lg" :class="metadataUploadResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
      <h3 class="font-semibold mb-2">{{ metadataUploadResult.message }}</h3>
      <div v-if="metadataUploadResult.success" class="text-sm">
        <p><strong>IPFS Hash:</strong> {{ metadataUploadResult.hash }}</p>
        <p><strong>URL:</strong> <a :href="metadataUploadResult.url" target="_blank" class="text-blue-600 hover:underline break-all">{{ metadataUploadResult.url }}</a></p>
      </div>
      <div v-if="!metadataUploadResult.success" class="text-sm">
        <p><strong>エラー:</strong> {{ metadataUploadResult.error }}</p>
      </div>
    </div>

    <!-- NFT発行コンポーネントを呼び出す -->
    <NFTMinter v-if="metadataUploadResult?.success" :metadata-url="metadataUploadResult.url" />

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">トップページへ</NuxtLink>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'
import ImageSelector from './components/ImageSelector.vue'
import { uploadMetadataToPinata } from '~/lib/pinata'  // Pinataのメタデータアップロード
import NFTMinter from './components/NFTMinter.vue' // NFTMinterコンポーネントをインポート

// ref() 変数の定義
const selectedFile = ref<File | null>(null)  // 画像ファイル
const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像のURL(spabase)
const isMetadataUploading = ref(false)  // メタデータのアップロード処理が進行中かどうか boolean
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
const handleImageUploaded = async (url: string, fileName: string) => {
  uploadedImageInfo.value = { url, fileName }  // アップロード済みの画像情報
  console.log('画像アップロード完了:', fileName)
  console.log('画像アップロードURL:', url)

  // 画像URLからNFTメタデータを生成
  const nftMetadata = {
    name: fileName.split('.')[0] || "Untitled NFT",
    description: `A unique NFT created from ${fileName} and uploaded via Pinata.`,
    image: url,
    attributes: [
      {
        trait_type: "Original Filename",
        value: fileName
      },
      {
        trait_type: "Upload Date",
        value: new Date().toISOString()
      }
    ]
  }

  console.log('生成されたNFTメタデータ:', nftMetadata)

  // 生成したメタデータをPinataにアップロード
  isMetadataUploading.value = true
  metadataUploadResult.value = null
  try {
    const result = await uploadMetadataToPinata(nftMetadata)  // pinataのapiレスポンスを格納
    metadataUploadResult.value = result
    console.log('メタデータアップロード結果:', result)
  } catch (error) {
    metadataUploadResult.value = {
      success: false,
      message: 'NFTメタデータのPinataアップロードに失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    console.error('NFTメタデータのPinataアップロードエラー:', error)
  } finally {
    isMetadataUploading.value = false
  }
}

// 環境変数のテスト
const config = useRuntimeConfig()
console.log(' runtimeConfig.public ')
console.log('supabaseUrl:', config.public.supabaseUrl)
console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>