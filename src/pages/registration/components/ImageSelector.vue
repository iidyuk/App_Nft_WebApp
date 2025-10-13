<template>
  <div
    class="my-4 rounded-lg mx-auto flex flex-col justify-center items-center"
    :style="{ backgroundColor: selectedImage ? 'transparent' : '#EAE9E9',  maxWidth: '600px',
      height: selectedImage ? 'auto' : '400px', minHeight: selectedImage ? '400px' : '400px' }"
  >
    
    <!-- ファイル選択ボタン -->
    <div v-if="!selectedImage" class="mt-16">
      <label for="image-upload" class="cursor-pointer inline-flex items-center gap-2 text-white font-semibold py-2 px-6 rounded transition">
        <svg xmlns="http://www.w3.org/2000/svg" height="120px" viewBox="0 -960 960 960" width="120px" fill="#1A1A1A">
          <path d="M480-480ZM186.67-120q-27 0-46.84-19.83Q120-159.67 120-186.67v-586.66q0-27 19.83-46.84Q159.67-840 186.67-840h350v66.67h-350v586.66h586.66v-350H840v350q0 27-19.83 46.84Q800.33-120 773.33-120H186.67ZM240-281.33h480L574-476 449.33-311.33 356.67-434 240-281.33Zm448.67-322V-688h-85.34v-66.67h85.34V-840h66.66v85.33H840V-688h-84.67v84.67h-66.66Z"/>
        </svg>
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/jpeg, image/jpg, image/png"
        class="hidden"
        @change="handleImageSelect"
      />
    </div>

    <!-- 選択された画像のプレビュー -->
    <div v-if="selectedImage" class="mt-4 flex items-center gap-16" style="height: 16rem;">
      <!-- 画像エリア（左側） -->
      <div class="flex-1 flex flex-col justify-center items-center">
        <img
          :src="selectedImage"
          alt="選択された画像"
          class="rounded-lg object-contain"
          style="width: 100%; max-width: 300px; max-height: 14rem;"
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedFileName }}</p>
      </div>
      
      <!-- 右側のエリア（アップロードボタンなど） -->
      <div class="flex flex-col justify-around items-center" style="height: 16rem;">
        <div class="flex flex-col items-center gap-12">
          <!-- アップロードボタンはImageUploaderコンポーネントで表示 -->
          <slot name="upload-section"></slot>
        </div>
      </div>
    </div>

    <!-- ファイルが選択されていない場合のメッセージ -->
    <div v-else class="mt-4 p-4 rounded-lg">
      <p class="text-gray-500">Click or Drag & Drop</p>
      <p class="text-xs text-gray-400 mt-1">※ JPG/JPEG/PNG files</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 画像選択関連のリアクティブ変数
  const selectedImage = ref<string | null>(null)
  const selectedFileName = ref<string>('')
  const selectedFile = ref<File | null>(null)

  // emit（親コンポーネントに渡すデータ）の設定
  const emit = defineEmits<{
    imageSelected: [file: File, imageUrl: string]
  }>()

  // 画像選択処理
  const handleImageSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
      // ファイル拡張子チェック
      const fileExtension = file.name.split('.').at(-1)?.toLowerCase()
      if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
        alert('jpg/jpeg/pngファイルのみ選択可能です')
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
        emit('imageSelected', file, imageUrl)  // 親コンポーネントに選択されたファイル情報を渡す
      }
      
      reader.onerror = (e) => {
        console.error('FileReader error:', e)
      }

      reader.readAsDataURL(file)
    }
  }

  // 外部からアクセス可能なメソッドを公開
  defineExpose({
    selectedFile,
    selectedFileName,
    selectedImage,
    clearSelection: () => {
      selectedImage.value = null
      selectedFileName.value = ''
      selectedFile.value = null
    }
  })
</script>