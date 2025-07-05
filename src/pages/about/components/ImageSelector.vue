<template>
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">画像を選択してください</h2>
    
    <!-- ファイル選択ボタン -->
    <div class="mb-4">
      <label for="image-upload" class="cursor-pointer inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition">
        画像を選択
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
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
    </div>

    <!-- ファイルが選択されていない場合のメッセージ -->
    <div v-else class="mt-4 p-4 bg-gray-100 rounded-lg">
      <p class="text-gray-500">画像を選択してください</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 画像選択関連のリアクティブ変数
const selectedImage = ref<string | null>(null)
const selectedFileName = ref<string>('')

// 親コンポーネントに選択されたファイル情報を渡すためのemit
const emit = defineEmits<{
  imageSelected: [file: File, imageUrl: string]
}>()

// 画像選択処理
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // ファイル名を保存
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
  }
}

// 外部からアクセス可能なメソッドを公開
defineExpose({
  selectedImage,
  selectedFileName,
  clearSelection: () => {
    selectedImage.value = null
    selectedFileName.value = ''
  }
})
</script> 