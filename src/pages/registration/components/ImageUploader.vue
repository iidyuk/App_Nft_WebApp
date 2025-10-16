<template>
  <div class="flex flex-col items-center gap-12">
    <!-- Supabaseアップロードボタン -->
      <button
        @click="handleUpload"
        :disabled="isUploading || isUploaded || isAlreadyUploaded"
        class="group disabled:bg-gray-300 text-white font-semibold py-2 px-2 rounded transition relative overflow-hidden w-32 sm:w-40"
        :class="(isUploaded || isAlreadyUploaded) ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'"
      >
        <span class="block transition-transform duration-300 group-hover:-translate-y-[150%]">
          Upload Image
        </span>
        <span class="block absolute inset-0 flex items-center justify-center transition-transform duration-300 transform translate-y-[120%] group-hover:translate-y-0">
          to Supabase
        </span>
      </button>
    
    <!-- Upload Metadataボタン -->
     <button
       @click="handleMetadataUpload"
       :disabled="(!isUploaded && !isAlreadyUploaded) || isMetadataUploaded || hasExistingMetadata"
       class="group disabled:bg-gray-300 text-white font-semibold py-2 px-2 rounded transition relative overflow-hidden w-32 sm:w-40"
       :class="(isMetadataUploaded || hasExistingMetadata) ? 'bg-gray-400' : ((isUploaded || isAlreadyUploaded) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300')"
     >
       <span class="block transition-transform duration-300 group-hover:-translate-y-[150%]">
         Upload Metadata
       </span>
       <span class="block absolute inset-0 flex items-center justify-center transition-transform duration-300 transform translate-y-[120%] group-hover:translate-y-0">
         to Pinata
       </span>
     </button>
    
    <!-- Create NFTボタン -->
    <button
      @click="handleCreateNFT"
      :disabled="!isMetadataUploaded || isNFTCreated"
      class="group disabled:bg-gray-300 text-white font-semibold py-2 px-2 rounded transition relative overflow-hidden w-32 sm:w-40"
      :class="isNFTCreated ? 'bg-gray-400' : (isMetadataUploaded ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300')"
    >
      <span class="block transition-transform duration-300 group-hover:-translate-y-[150%]">
        Mint NFT
      </span>
      <span class="block absolute inset-0 flex items-center justify-center transition-transform duration-300 transform translate-y-[120%] group-hover:translate-y-0">
        to Ethereum
      </span>
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
    isNFTCreated?: boolean  // NFT作成完了状態
    hasExistingMetadata?: boolean  // DBに既存メタデータがあるかどうか
    isAlreadyUploaded?: boolean  // 既にSupabaseにアップロード済みかどうか（Listページから遷移した場合）
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
  const isNFTCreated = computed(() => props.isNFTCreated || false)
  const hasExistingMetadata = computed(() => props.hasExistingMetadata || false)
  const isAlreadyUploaded = computed(() => props.isAlreadyUploaded || false)

  // デバッグ用：ボタンの状態をログ出力
  watch([isUploaded, isAlreadyUploaded, isMetadataUploaded, hasExistingMetadata], 
    ([uploaded, alreadyUploaded, metadataUploaded, existingMetadata]) => {
      console.log('=== ImageUploader ボタン状態 ===')
      console.log('isUploaded:', uploaded)
      console.log('isAlreadyUploaded:', alreadyUploaded)
      console.log('isMetadataUploaded:', metadataUploaded)
      console.log('hasExistingMetadata:', existingMetadata)
      console.log('Upload Metadata ボタン disabled:', (!uploaded && !alreadyUploaded) || metadataUploaded || existingMetadata)
      console.log('================================')
    }, 
    { immediate: true }
  )

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
    // アップロード済み、または既にSupabaseにアップロード済みの場合のみ実行
    if (!isUploaded.value && !isAlreadyUploaded.value) {
      console.log('画像がアップロードされていません')
      return
    }
    console.log('メタデータアップロード要求を送信')
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
