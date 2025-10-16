<template>
  <!-- メタデータアップロード処理中の表示 -->
  <div v-if="isUploading" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
    <h3 class="text-lg font-medium text-green-800 mb-4">NFTメタデータ作成</h3>
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
      <p class="text-green-700">メタデータをPINATAにアップロード中...</p>
    </div>
  </div>

  <!-- アップロード完了時の表示 -->
  <div v-else-if="uploadResult" class="mt-4 p-4 rounded-lg" :class="uploadResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
    <h3 class="text-lg font-medium mb-4">NFTメタデータ作成</h3>
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
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineProps, defineEmits } from 'vue'
  import { uploadMetadataToPinata } from '~/lib/external/pinata'

  interface UploadedImageInfo {
    url: string
    fileName: string
    description?: string
  }

  interface MetadataUploadResult {
    success: boolean
    message: string
    hash?: string
    url?: string
    error?: string
  }

  const props = defineProps<{
    uploadedImageInfo: UploadedImageInfo | null  // 画像情報
    autoUpload?: boolean // 自動アップロードするかどうか
    uploadRequested?: boolean // メタデータアップロード要求フラグ
    // customMetadata?: object // カスタムメタデータ（オプション）  ??
  }>()

  const emit = defineEmits<{
    metadataUploaded: [result: MetadataUploadResult]
    statusMessage: [message: string, type: 'success' | 'error' | 'info']
    // uploadStarted: []  // ??
    // uploadCompleted: [success: boolean]  // ??
  }>()

  const isUploading = ref(false)
  const uploadResult = ref<MetadataUploadResult | null>(null)

  // アップローダーを表示するかどうか
  const shouldShowUploader = computed(() => {
    return props.uploadedImageInfo !== null
  })

  // ステータスメッセージをemitする関数
  const emitStatusMessage = (message: string, type: 'success' | 'error' | 'info') => {
    emit('statusMessage', message, type)
  }

  // メタデータ生成関数
  // const generateNFTMetadata = (imageInfo: UploadedImageInfo, customData?: object) => {
  const generateNFTMetadata = (imageInfo: UploadedImageInfo) => {
    const baseMetadata = {
      name: imageInfo.fileName || "Untitled NFT",
      description: imageInfo.description,
      image: imageInfo.url,
      attributes: [
        // {
        //   trait_type: "Original Filename",
        //   value: imageInfo.fileName
        // },
        {
          trait_type: "Upload Date",
          value: new Date().toISOString()
        }
      ]
    }

    // カスタムメタデータがある場合はマージ
    // return customData ? { ...baseMetadata, ...customData } : baseMetadata
    return baseMetadata
  }

  // メタデータアップロード処理
  const handleUploadMetadata = async () => {
    console.log('🚀 handleUploadMetadata開始')
    console.log('uploadedImageInfo:', props.uploadedImageInfo)

    if (!props.uploadedImageInfo) {
      console.error('❌ 画像情報がありません')
      emitStatusMessage('画像情報がありません', 'error')
      return
    }

    console.log('✅ 画像情報あり、アップロード処理を続行')
    isUploading.value = true  // アップロード状態
    uploadResult.value = null  // Pinataへのアップロードデータ用
    emitStatusMessage('メタデータをPINATAにアップロード中...', 'info')
    // emit('uploadStarted')

    try {
      // NFTメタデータを生成
      // const nftMetadata = generateNFTMetadata(props.uploadedImageInfo, props.customMetadata)
      const nftMetadata = generateNFTMetadata(props.uploadedImageInfo)  // メタデータ生成
      console.log('生成されたNFTメタデータ:', nftMetadata)

      // PINATAにアップロード
      console.log('Pinataへアップロード開始...')
      const result = await uploadMetadataToPinata(nftMetadata, props.uploadedImageInfo.fileName)
      console.log('Pinataアップロード完了:', result)
      uploadResult.value = result  // Pinataへのアップロードデータ
      
      console.log('メタデータアップロード結果:', result)
      emit('metadataUploaded', result)
      
      if (result.success) {
        emitStatusMessage('メタデータのアップロードが完了しました', 'success')
      } else {
        emitStatusMessage('メタデータのアップロードに失敗しました', 'error')
      }
      // emit('uploadCompleted', result.success)
      
    } catch (error) {
      const errorResult: MetadataUploadResult = {
        success: false,
        message: 'NFTメタデータのPinataアップロードに失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      uploadResult.value = errorResult
      console.error('NFTメタデータのPinataアップロードエラー:', error)
      emit('metadataUploaded', errorResult)
      emitStatusMessage('メタデータのアップロードに失敗しました', 'error')
      // emit('uploadCompleted', false)
      
    } finally {
      isUploading.value = false
    }
  }

  // 再試行処理
  const retryUpload = () => {
    uploadResult.value = null
    handleUploadMetadata()
  }

  // メタデータアップロード要求の監視
  watch(() => props.uploadRequested, (requested) => {
    console.log('🔔 MetadataUploader: uploadRequested変更を検知')
    console.log('requested:', requested)
    console.log('uploadedImageInfo:', props.uploadedImageInfo)
    if (requested && props.uploadedImageInfo) {
      console.log('✅ メタデータアップロード処理を開始します')
      handleUploadMetadata()
    } else {
      if (!requested) console.log('❌ requestedがfalseです')
      if (!props.uploadedImageInfo) console.log('❌ uploadedImageInfoがありません')
    }
  })

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
  // defineExpose({
    // uploadResult,
    // isUploading,
    // handleUploadMetadata,
    // retryUpload
  // })
</script>
