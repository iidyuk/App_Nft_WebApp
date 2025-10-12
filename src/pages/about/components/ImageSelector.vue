<template>
  <div
    class="my-8 p-6 rounded-lg mx-auto w-full flex flex-col justify-center"
    :style="{ backgroundColor: '#EAE9E9', maxWidth: '800px',
      height: selectedImage ? 'auto' : '400px', minHeight: selectedImage ? '400px' : '400px' }"
  >
    
    <!-- ファイル選択ボタン -->
    <div v-if="!selectedImage" class="mb-4">
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
    <div v-if="selectedImage" class="mt-4">
      <div>
        <img
          :src="selectedImage"
          alt="選択された画像"
          class="mx-auto rounded-lg shadow-md object-contain"
          style="width: 30vw; min-width: 240px; max-height: 16rem;"
        />
        <p class="text-sm text-gray-500 mt-2">{{ selectedFileName }}</p>
      </div>
      
      <!-- アップロードボタン -->
      <div>
        <p class="mb-2">
          <button
            @click="handleUpload"
            :disabled="isUploading || isUploaded"
            class="disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded transition"
            :class="isUploaded ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'"
          >
            {{ isUploaded ? 'Upload Complete' : (isUploading ? 'Uploading...' : 'Upload to Supabase') }}
          </button>
        </p>
      </div>

      <!-- アップロード進捗 -->
      <!-- <div v-if="isUploading" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">{{ uploadProgress }}% 完了</p>
      </div> -->

      <!-- アップロードエラー -->
      <div v-if="uploadError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        <p class="text-sm">{{ uploadError }}</p>
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
  // 画像アップロード機能をインポート
  const { 
    isUploading,
    uploadError,
    // uploadProgress,
    // uploadedImageUrl,
    uploadImage,
    resetUploadState
  } = useSupabaseUpload()

  // 画像選択関連のリアクティブ変数
  const selectedImage = ref<string | null>(null)
  const selectedFileName = ref<string>('')
  const selectedFile = ref<File | null>(null)

  //props（親コンポーネントから渡されるデータ）の設定
  const props = defineProps<{isUploaded: boolean}>()
  const isUploaded = computed(() => props.isUploaded || false)

  // emit（親コンポーネントに渡すデータ）の設定
  const emit = defineEmits<{
    imageSelected: [file: File, imageUrl: string]
    imageUploaded: [url: string, fileName: string]
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
      reader.onload = (e) => {  // onloadイベントハンドラー設定
        const imageUrl = e.target?.result as string
          // result は string | ArrayBuffer | null 型だが、readAsDataURL の場合は文字列になるので as string で型を指定
            // const fileReader = e.target as FileReader
            // const base64DataUrl = fileReader.result .. string
            // const imageUrl = base64DataUrl as string

        selectedImage.value = imageUrl
        
        emit('imageSelected', file, imageUrl)  // 親コンポーネントに選択されたファイル情報を渡す
      }

      reader.readAsDataURL(file)  // ファイルをBase64エンコードされたデータURLとして読み込み
        // 形式 data:image/jpeg;base64,/9j/4AAQ...
          // data: - データURLのプレフィックス, image/jpeg - MIMEタイプ, base64, - エンコーディング方式, /9j/4AAQ... - Base64エンコードされたデータ

      resetUploadState()  // 前回のアップロード状態をリセット

      // 処理のフロー
        // 1.ユーザーがファイルを選択  2.FileReaderオブジェクトを作成  3.onloadイベントハンドラーを設定
        // 4.readAsDataURL(file)で読み込み開始
        // 5.読み込み完了時（reader.readAsDataURL）にreader.onloadが発火
        // 6.e.target.resultにBase64データURLが格納される
        // 7.selectedImage.valueにデータURLを設定  8.emitで親コンポーネントに通知

    }
  }

  // アップロード処理
  const handleUpload = async () => {
    if (!selectedFile.value) return
    
    const result = await uploadImage(selectedFile.value, 'images')  // imagesバケットを指定して画像データをアップロード
    
    if (result.success && result.url && result.fileName) {
      emit('imageUploaded', result.url, result.fileName)  // 親コンポーネントにアップロード完了を通知
    }
  }

  // URLをクリップボードにコピー
  // const copyUrl = async () => {
  //   if (uploadedImageUrl.value) {
  //     try {
  //       await navigator.clipboard.writeText(uploadedImageUrl.value)
  //       alert('URLをクリップボードにコピーしました')
  //     } catch (error) {
  //       console.error('URLのコピーに失敗しました:', error)
  //     }
  //   }
  // }

  // 外部からアクセス可能なメソッドを公開
  // defineExpose({
    // selectedImage,
    // selectedFileName,
    // uploadedImageUrl,
    // clearSelection: () => {
    //   selectedImage.value = null
    //   selectedFileName.value = ''
    //   selectedFile.value = null
    //   resetUploadState()
    // }
  // })
</script> 