<template>
  <div class="max-w-4xl mx-auto mt-8 p-8 text-center">
    <h1 class="text-3xl font-bold mb-6">画像アップロード</h1>
    
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
      @image-uploaded="handleImageUploaded"
      :is-uploaded="!!uploadedImageInfo"
    />

    <!-- アップロード完了情報の表示 -->
    <div v-if="uploadedImageInfo" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-lg font-medium text-blue-800 mb-2">画像アップロード完了</h3>
      
      <!-- NFT作成ページへの遷移ボタン -->
      <div class="mt-4">
        <NuxtLink 
          :to="`/nft-creation?imageUrl=${encodeURIComponent(uploadedImageInfo.url)}&fileName=${encodeURIComponent(uploadedImageInfo.fileName)}`"
          class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          次のステップ: メタデータ作成
        </NuxtLink>
      </div>
    </div>

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">Top Page</NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ImageSelector from './components/ImageSelector.vue'

  // ref() 変数の定義
  const selectedFile = ref<File | null>(null)  // 画像ファイル
  const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
  const uploadedImageInfo = ref<{ url: string; fileName: string } | null>(null)  // 画像のURL(supabase)

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
    console.log('選択されたファイル:', file.name)
    console.log('ファイルサイズ:', file.size, 'bytes')
  }

  // 画像アップロード完了時の処理
  const handleImageUploaded = (url: string, fileName: string) => {
    uploadedImageInfo.value = { url, fileName }  // アップロード済みの画像情報
    console.log('画像アップロード完了:', fileName)
    console.log('画像アップロードURL:', url)
  }

  // 環境変数のテスト
  // const config = useRuntimeConfig()
  // console.log(' runtimeConfig.public ')
  // console.log('supabaseUrl:', config.public.supabaseUrl)
  // console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>