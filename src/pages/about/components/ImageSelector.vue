<template>
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">JPG画像を選択してください</h2>
    
    <!-- ファイル選択ボタン -->
    <div class="mb-4">
      <label for="image-upload" class="cursor-pointer inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition">
        画像を選択
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/jpg"
        class="hidden"
        @change="handleImageSelect"
      />
    </div>

    <!-- 選択された画像のプレビュー -->
    <div v-if="selectedImage" class="mt-4">
      <h3 class="text-lg font-medium text-gray-600 mb-2">選択された画像:</h3>
      <img
        :src="selectedImage"
        alt="選択された画像"
        class="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
      />
      <p class="text-sm text-gray-500 mt-2">{{ selectedFileName }}</p>
      
      <!-- アップロードボタン -->
      <div class="mt-4">
        <button
          @click="handleUpload"
          :disabled="isUploading"
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition"
        >
          {{ isUploading ? 'アップロード中...' : 'Supabaseにアップロード' }}
        </button>
      </div>

      <!-- アップロード進捗 -->
      <div v-if="isUploading" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">{{ uploadProgress }}% 完了</p>
      </div>

      <!-- アップロードエラー -->
      <div v-if="uploadError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        <p class="text-sm">{{ uploadError }}</p>
      </div>

      <!-- アップロード成功 -->
      <div v-if="uploadedImageUrl" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        <p class="text-sm font-semibold mb-2">アップロード成功！</p>
        <p class="text-xs break-all">{{ uploadedImageUrl }}</p>
        <button
          @click="copyUrl"
          class="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-3 rounded"
        >
          URLをコピー
        </button>
      </div>
    </div>

    <!-- ファイルが選択されていない場合のメッセージ -->
    <div v-else class="mt-4 p-4 bg-gray-100 rounded-lg">
      <p class="text-gray-500">JPG画像を選択してください</p>
      <p class="text-xs text-gray-400 mt-1">※ JPG/JPEGファイルのみ対応</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 画像アップロード機能をインポート
const { uploadImage, isUploading, uploadProgress, uploadedImageUrl, uploadError, resetUploadState } = useImageUpload()

// 画像選択関連のリアクティブ変数
const selectedImage = ref<string | null>(null)
const selectedFileName = ref<string>('')
const selectedFile = ref<File | null>(null)

// 親コンポーネントに選択されたファイル情報を渡すためのemit
const emit = defineEmits<{
  imageSelected: [file: File, imageUrl: string]
  imageUploaded: [url: string, fileName: string]
}>()

// 画像選択処理
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // JPGファイルかどうかをチェック
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (fileExtension !== 'jpg' && fileExtension !== 'jpeg') {
      alert('JPG/JPEGファイルのみ選択可能です')
      target.value = '' // ファイル選択をリセット
      return
    }
    
    // ファイルを保存
    selectedFile.value = file
    selectedFileName.value = file.name
    
    // ファイルをURLに変換してプレビュー表示
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      selectedImage.value = imageUrl
      
      // 親コンポーネントに選択されたファイル情報を渡す
      emit('imageSelected', file, imageUrl)
    }
    reader.readAsDataURL(file)
    
    // 前回のアップロード状態をリセット
    resetUploadState()
  }
}

// アップロード処理
const handleUpload = async () => {
  if (!selectedFile.value) return
  
  const result = await uploadImage(selectedFile.value)
  
  if (result.success && result.url && result.fileName) {
    // 親コンポーネントにアップロード完了を通知
    emit('imageUploaded', result.url, result.fileName)
  }
}

// URLをクリップボードにコピー
const copyUrl = async () => {
  if (uploadedImageUrl.value) {
    try {
      await navigator.clipboard.writeText(uploadedImageUrl.value)
      alert('URLをクリップボードにコピーしました')
    } catch (error) {
      console.error('URLのコピーに失敗しました:', error)
    }
  }
}

// 外部からアクセス可能なメソッドを公開
defineExpose({
  selectedImage,
  selectedFileName,
  uploadedImageUrl,
  clearSelection: () => {
    selectedImage.value = null
    selectedFileName.value = ''
    selectedFile.value = null
    resetUploadState()
  }
})
</script> 