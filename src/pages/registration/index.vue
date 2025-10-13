<template>
  <div class="max-w-4xl mx-auto mt-8 p-8 text-center">
    <h1 class="text-3xl font-bold mb-6">Registration</h1>
    
    <!-- ステップ表示 -->
    <div class="mb-4 flex justify-center items-center">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="flex items-center"
        :style="{ marginRight: index < steps.length - 1 ? '40px' : '0' }"
      >
        <div  :class="['text-sm', step.isActive ? 'text-gray-600' : 'text-gray-300']">
          {{ step.number }}
        </div>
        <span :class="['text-sm', step.isActive ? 'text-gray-600' : 'text-gray-300']">
          {{ step.title }}
        </span>
      </div>
    </div>

    <!-- 画像選択・アップロード用コンポーネント @はv-on :はv-bind -->
    <ImageSelector 
      @image-selected="handleImageSelected"
    >
      <template #upload-section>
        <ImageUploader 
          v-if="selectedFile"
          :selected-file="selectedFile"
          :selected-file-name="selectedFileName"
          :is-metadata-uploaded="!!metadataUploadResult?.success"
          @image-uploaded="handleImageUploaded"
          @status-message="handleStatusMessage"
          @metadata-upload-requested="handleMetadataUploadRequested"
          @nft-creation-requested="handleNFTCreationRequested"
        />
      </template>
    </ImageSelector>

    <!-- MetadataUploader（ImageUploaderの下段） -->
    <MetadataUploader 
      v-if="uploadedImageInfo"
      :uploaded-image-info="uploadedImageInfo"
      :upload-requested="metadataUploadRequested"
      @metadata-uploaded="handleMetadataUploaded"
      @status-message="handleStatusMessage"
    />

    <!-- ステータスメッセージ表示（画像とボタン部分の下段） -->
    <div v-if="statusMessage" class="mt-4 p-3 rounded-lg" :class="getStatusMessageClass(statusMessageType)">
      <p class="text-sm">{{ statusMessage }}</p>
    </div>

    <!-- NFTMinter（MetadataUploaderの下段） -->
    <NFTMinter 
      v-if="metadataUploadResult?.success"
      :metadata-url="metadataUploadResult.url || ''"
      :mint-requested="nftCreationRequested"
      @status-message="handleStatusMessage"
    />

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">Top Page</NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ImageSelector from './components/ImageSelector.vue'
  import ImageUploader from './components/ImageUploader.vue'
  import MetadataUploader from './components/MetadataUploader.vue'
  import NFTMinter from './components/NFTMinter.vue'

  // ref() 変数の定義
  const selectedFile = ref<File | null>(null)  // 画像ファイル
  const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
  const selectedFileName = ref<string>('')  // 選択されたファイル名
  const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像のURL(supabase)
  const metadataUploadResult = ref<{ success: boolean; url?: string; hash?: string; message: string; error?: string } | null>(null)  // メタデータアップロード結果
  const statusMessage = ref<string>('')  // ステータスメッセージ
  const statusMessageType = ref<'success' | 'error' | 'info'>('info')  // ステータスメッセージのタイプ
  const metadataUploadRequested = ref<boolean>(false)  // メタデータアップロード要求フラグ
  const nftCreationRequested = ref<boolean>(false)  // NFT作成要求フラグ

  // ステップ情報の定義
  const steps = ref([
    { number: 1, title: '画像アップロード', isActive: true },
    { number: 2, title: 'メタデータ作成', isActive: false },
    { number: 3, title: 'NFT発行', isActive: false }
  ])

  //// 関数定義
  // 画像選択時の処理
  const handleImageSelected = (file: File, imageUrl: string) => {
    selectedFile.value = file
    selectedImageUrl.value = imageUrl
    selectedFileName.value = file.name
    console.log('選択されたファイル:', file.name)
    console.log('ファイルサイズ:', file.size, 'bytes')
  }

  // 画像アップロード完了時の処理
  const handleImageUploaded = (url: string, fileName: string) => {
    uploadedImageInfo.value = { url, fileName }  // アップロード済みの画像情報
    // ステップ2をアクティブにする
    steps.value[1].isActive = true
    console.log('画像アップロード完了:', fileName)
    console.log('画像アップロードURL:', url)
  }

  // NFT作成要求の処理
  const handleNFTCreationRequested = () => {
    nftCreationRequested.value = true
    // ステップ3をアクティブにする
    steps.value[2].isActive = true
  }

  // メタデータアップロード要求の処理
  const handleMetadataUploadRequested = () => {
    metadataUploadRequested.value = true
    // ステップ2をアクティブにする
    steps.value[1].isActive = true
  }

  // メタデータアップロード完了時の処理
  const handleMetadataUploaded = (result: { success: boolean; url?: string; hash?: string; message: string; error?: string }) => {
    metadataUploadResult.value = result
    metadataUploadRequested.value = false  // 要求フラグをリセット
    if (result.success) {
      // ステップ3をアクティブにする
      steps.value[2].isActive = true
    }
    console.log('メタデータアップロード完了:', result)
  }

  // ステータスメッセージの処理
  const handleStatusMessage = (message: string, type: 'success' | 'error' | 'info') => {
    statusMessage.value = message
    statusMessageType.value = type
    
    // 成功メッセージは3秒後に自動で消す
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.value = ''
      }, 3000)
    }
  }

  // ステータスメッセージのCSSクラスを取得
  const getStatusMessageClass = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border border-green-400 text-green-700'
      case 'error':
        return 'bg-red-100 border border-red-400 text-red-700'
      case 'info':
        return 'bg-blue-100 border border-blue-400 text-blue-700'
      default:
        return 'bg-gray-100 border border-gray-400 text-gray-700'
    }
  }

  // 環境変数のテスト
  // const config = useRuntimeConfig()
  // console.log(' runtimeConfig.public ')
  // console.log('supabaseUrl:', config.public.supabaseUrl)
  // console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>