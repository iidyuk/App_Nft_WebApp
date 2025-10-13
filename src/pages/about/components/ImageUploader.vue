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
    
    <!-- MetadataUploaderのボタン部分 -->
    <MetadataUploaderButton 
      v-if="isUploaded"
      :uploaded-image-info="{ url: uploadedImageUrl || '', fileName: selectedFileName }"
      @metadata-uploaded="handleMetadataUploaded"
    />
    
    <!-- Create NFTボタン（将来の実装用） -->
    <button
      disabled
      class="bg-gray-300 text-gray-500 font-semibold py-2 px-6 rounded"
    >
      Create NFT
    </button>
  </div>
</template>

<script setup lang="ts">
  import MetadataUploaderButton from './MetadataUploader.vue'

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
  }>()

  // emit（親コンポーネントに渡すデータ）の設定
  const emit = defineEmits<{
    imageUploaded: [url: string, fileName: string]
    metadataUploaded: [result: any]
    statusMessage: [message: string, type: 'success' | 'error' | 'info']
  }>()

  // アップロード状態の計算プロパティ
  const isUploaded = computed(() => !!uploadedImageUrl.value)

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

  // メタデータアップロード完了時の処理
  const handleMetadataUploaded = (result: any) => {
    emit('metadataUploaded', result)  // 親コンポーネントにメタデータアップロード完了を通知
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
