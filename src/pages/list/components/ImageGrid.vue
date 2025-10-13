<template>
  <!-- ローディング状態 -->
  <div v-if="isLoading" class="text-center py-8">
    <!-- <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div> -->
    
     <svg class="mx-auto size-6 animate-spin text-green-600" viewBox="0 0 24 24" fill="none">
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4" 
        class="opacity-25"
      />
      <path 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        class="opacity-75"
      />
    </svg>
    <p class="mt-2 text-gray-600">Loading...</p>
  </div>

  <!-- エラー状態 -->
  <div v-else-if="error" class="text-center py-8">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p class="font-bold">エラーが発生しました</p>
      <p class="text-sm">{{ errorMessage }}</p>
    </div>
    <button 
      @click="$emit('retry')" 
      class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
    >
      再試行
    </button>
  </div>

  <!-- データがない場合 -->
  <div v-else-if="images.length === 0 && !isLoading" class="text-center py-8">
    <p class="text-gray-600 text-lg">no data</p>
  </div>

  <!-- 画像一覧 -->
  <div v-else>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center px-4">
      <div 
        v-for="image in paginatedImages" 
        :key="image.url"
        class="rounded-lg overflow-hidden hover:shadow-lg hover:cursor-pointer transition-shadow w-full max-w-xs"
        @click="openPopup(image)"
      >
        <!-- 画像 -->
        <div class="w-full bg-gray-200 flex items-center justify-center">
          <img 
            :src="image.url" 
            :alt="image.name"
            class="w-full h-auto object-cover rounded-t"
            @error="handleImageError"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 画像モーダル -->
  <ImageModal 
    :is-visible="showPopup"
    :image="selectedImage"
    @close="closePopup"
    @watch="handleWatch"
    @list="handleList"
    @register="handleRegister"
  />
</template>

<script setup lang="ts">
import ImageModal from './ImageModal.vue'

// 型定義
interface ImageFile {
  name: string
  url: string
  updated_at: string
  created_at: string
  metadata?: {
    size: number
    mimetype: string
  }
}

// Props
interface Props {
  isLoading: boolean
  error: boolean
  errorMessage: string
  images: ImageFile[]
  paginatedImages: ImageFile[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'retry': []
}>()

// ポップアップの状態管理
const showPopup = ref(false)
const selectedImage = ref<ImageFile | null>(null)

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial, sans-serif" font-size="14">画像を読み込めません</text></svg>'
}

// ポップアップ関連のメソッド
const openPopup = (image: ImageFile) => {
  selectedImage.value = image
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedImage.value = null
}

// ボタンクリックハンドラー
const handleWatch = (image: ImageFile) => {
  console.log('Watch clicked for:', image.name)
  // ここにWatch機能の実装を追加
}

const handleList = (image: ImageFile) => {
  console.log('List clicked for:', image.name)
  // ここにList機能の実装を追加
}

const handleRegister = (image: ImageFile) => {
  console.log('Register clicked for:', image.name)
  // ここにRegister機能の実装を追加
}
</script>
