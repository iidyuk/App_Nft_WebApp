<template>
  <div v-if="shouldShowUploader" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <h3 class="text-lg font-medium text-yellow-800 mb-4">NFTメタデータ作成</h3>
    
    <!-- メタデータアップロード中の表示 -->
    <div v-if="isUploading" class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-2"></div>
      <p class="text-yellow-700">メタデータをPINATAにアップロード中...</p>
    </div>
    
    <!-- アップロード完了時の表示 -->
    <div v-else-if="uploadResult" class="rounded-lg" :class="uploadResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
      <h4 class="font-semibold mb-2">{{ uploadResult.message }}</h4>
      <div v-if="uploadResult.success" class="text-sm">
        <p><strong>IPFS Hash:</strong> {{ uploadResult.hash }}</p>
        <p><strong>URL:</strong> <a :href="uploadResult.url" target="_blank" class="text-blue-600 hover:underline break-all">{{ uploadResult.url }}</a></p>
      </div>
      <div v-if="!uploadResult.success" class="text-sm">
        <p><strong>エラー:</strong> {{ uploadResult.error }}</p>
        <button 
          @click="retryUpload" 
          class="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
        >
          再試行
        </button>
      </div>
    </div>
    
    <!-- 手動アップロードボタン -->
    <div v-else class="text-center">
      <button
        @click="handleUploadMetadata"
        class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        メタデータを生成してPINATAにアップロード
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { uploadMetadataToPinata } from '~/lib/external/pinata'

interface UploadedImageInfo {
  url: string
  fileName: string
}

interface MetadataUploadResult {
  success: boolean
  message: string
  hash?: string
  url?: string
  error?: string
}

const props = defineProps<{
  uploadedImageInfo: UploadedImageInfo | null
  autoUpload?: boolean // 自動アップロードするかどうか（デフォルト: true）
  customMetadata?: object // カスタムメタデータ（オプション）
}>()

const emit = defineEmits<{
  metadataUploaded: [result: MetadataUploadResult]
  uploadStarted: []
  uploadCompleted: [success: boolean]
}>()

const isUploading = ref(false)
const uploadResult = ref<MetadataUploadResult | null>(null)

// アップローダーを表示するかどうか
const shouldShowUploader = computed(() => {
  return props.uploadedImageInfo !== null
})

// メタデータ生成関数
const generateNFTMetadata = (imageInfo: UploadedImageInfo, customData?: object) => {
  const baseMetadata = {
    name: imageInfo.fileName.split('.')[0] || "Untitled NFT",
    description: `A unique NFT created from ${imageInfo.fileName} and uploaded via Pinata.`,
    image: imageInfo.url,
    attributes: [
      {
        trait_type: "Original Filename",
        value: imageInfo.fileName
      },
      {
        trait_type: "Upload Date",
        value: new Date().toISOString()
      }
    ]
  }

  // カスタムメタデータがある場合はマージ
  return customData ? { ...baseMetadata, ...customData } : baseMetadata
}

// メタデータアップロード処理
const handleUploadMetadata = async () => {
  if (!props.uploadedImageInfo) {
    console.error('画像情報がありません')
    return
  }

  isUploading.value = true
  uploadResult.value = null
  emit('uploadStarted')

  try {
    // NFTメタデータを生成
    const nftMetadata = generateNFTMetadata(props.uploadedImageInfo, props.customMetadata)
    console.log('生成されたNFTメタデータ:', nftMetadata)

    // PINATAにアップロード
    const result = await uploadMetadataToPinata(nftMetadata)
    uploadResult.value = result
    
    console.log('メタデータアップロード結果:', result)
    emit('metadataUploaded', result)
    emit('uploadCompleted', result.success)
    
  } catch (error) {
    const errorResult: MetadataUploadResult = {
      success: false,
      message: 'NFTメタデータのPinataアップロードに失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    
    uploadResult.value = errorResult
    console.error('NFTメタデータのPinataアップロードエラー:', error)
    emit('metadataUploaded', errorResult)
    emit('uploadCompleted', false)
    
  } finally {
    isUploading.value = false
  }
}

// 再試行処理
const retryUpload = () => {
  uploadResult.value = null
  handleUploadMetadata()
}

// 画像情報が変更された時の自動アップロード（明示的にtrueの場合のみ）
watch(() => props.uploadedImageInfo, (newImageInfo) => {
  if (newImageInfo && props.autoUpload === true) {
    // 少し遅延を入れて自動アップロード
    setTimeout(() => {
      handleUploadMetadata()
    }, 500)
  }
}, { immediate: true })

// 外部からアクセス可能なメソッドを公開
defineExpose({
  uploadResult,
  isUploading,
  handleUploadMetadata,
  retryUpload
})
</script>
