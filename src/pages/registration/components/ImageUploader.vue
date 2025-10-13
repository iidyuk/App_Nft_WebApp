<template>
  <div class="flex flex-col items-center gap-12">
    <!-- Supabaseアップロードボタン -->
    <button
      @click="handleUpload"
      :disabled="isUploading || isUploaded"
      class="disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded transition"
      :class="isUploaded ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'"
    >
      {{ isUploaded ? 'Upload Complete' : (isUploading ? 'Uploading...' : 'Upload to Supabase') }}
    </button>
    
    <!-- Upload Metadataボタン -->
    <button
      @click="handleMetadataUpload"
      :disabled="!isUploaded"
      class="disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded transition"
      :class="isUploaded ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-300'"
    >
      Upload Metadata
    </button>
    
    <!-- Create NFTボタン -->
    <button
      @click="handleCreateNFT"
      :disabled="!isMetadataUploaded"
      class="disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded transition"
      :class="isMetadataUploaded ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300'"
    >
      Create NFT
    </button>
  </div>
</template>

<script setup lang="ts">
  // 画像アップロード機能をインポート
  const { 
    isUploading,
    uploadError,
    uploadedImageUrl,
    uploadImage,
    resetUploadState
  } = useSupabaseUpload()

  // props（親コンポーネントから渡されるデータ）の設定
  const props = defineProps<{
    selectedFile: File | null
    selectedFileName: string
    isMetadataUploaded?: boolean  // メタデータアップロード完了状態
  }>()

  // emit（親コンポーネントに渡すデータ）の設定
  const emit = defineEmits<{
    imageUploaded: [url: string, fileName: string]
    statusMessage: [message: string, type: 'success' | 'error' | 'info']
    metadataUploadRequested: []
    nftCreationRequested: []
  }>()

  // アップロード状態の計算プロパティ
  const isUploaded = computed(() => !!uploadedImageUrl.value)
  const isMetadataUploaded = computed(() => props.isMetadataUploaded || false)

  // ステータスメッセージをemitする関数
  const emitStatusMessage = (message: string, type: 'success' | 'error' | 'info') => {
    emit('statusMessage', message, type)
  }

  // アップロード処理
  const handleUpload = async () => {
    if (!props.selectedFile) return
    
    emitStatusMessage('画像をアップロード中...', 'info')
    
    const result = await uploadImage(props.selectedFile, 'images')  // imagesバケットを指定して画像データをアップロード
    
    if (result.success && result.url && result.fileName) {
      emitStatusMessage('画像のアップロードが完了しました', 'success')
      emit('imageUploaded', result.url, result.fileName)  // 親コンポーネントにアップロード完了を通知
    } else {
      emitStatusMessage('画像のアップロードに失敗しました', 'error')
    }
  }

  // メタデータアップロード要求の処理
  const handleMetadataUpload = () => {
    if (!isUploaded.value) return
    emit('metadataUploadRequested')  // 親コンポーネントにメタデータアップロード要求を通知
  }

  // NFT作成要求の処理
  const handleCreateNFT = () => {
    if (!isMetadataUploaded.value) return
    emit('nftCreationRequested')  // 親コンポーネントにNFT作成要求を通知
  }

  // ファイルが変更された時にアップロード状態をリセット
  watch(() => props.selectedFile, () => {
    resetUploadState()
  })

  // アップロードエラーを監視してemit
  watch(uploadError, (newError) => {
    if (newError) {
      emitStatusMessage(newError, 'error')
    }
  })
</script>
