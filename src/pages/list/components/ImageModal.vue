<template>
  <!-- ポップアップモーダル -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <!-- 背景オーバーレイ -->
    <div class="absolute inset-0 bg-gray-900 bg-opacity-95"></div>
    
    <!-- ポップアップコンテンツ -->
    <div 
      class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- ヘッダー（閉じるボタン） -->
      <div class="flex justify-end p-4">
        <button 
          @click="closeModal"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- メインコンテンツ -->
      <div class="flex flex-col lg:flex-row">
        <!-- 左側：画像 -->
        <div class="lg:w-1/2 p-4">
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-none mx-auto lg:mx-0">
            <img 
              v-if="image"
              :src="image.url" 
              :alt="image.name"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- 右側：テキスト情報 -->
        <div class="lg:w-1/2 p-4 space-y-6">
          <!-- Title -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Title</h3>
            <p class="text-lg font-semibold text-gray-900">{{ image?.name || 'No title' }}</p>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p class="text-gray-700">{{ getDescription(image) }}</p>
          </div>

          <!-- Chain -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Chain</h3>
            <p class="text-gray-700">{{ getChain(image) }}</p>
          </div>

          <!-- Mint Date -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2"> Date</h3>
            <p class="text-gray-700">{{ getMintDate(image) }}</p>
          </div>
        </div>
      </div>

      <!-- フッター：ボタン -->
      <div class="flex justify-end gap-3 p-4 border-t border-gray-200">
        <button 
          @click="handleWatch"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Watch
        </button>
        <button 
          @click="handleList"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          List
        </button>
        <button 
          @click="handleRegister"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  isVisible: boolean
  image: ImageFile | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'watch': [image: ImageFile]
  'list': [image: ImageFile]
  'register': [image: ImageFile]
}>()

// Methods
const closeModal = () => {
  emit('close')
}

// ボタンクリックハンドラー
const handleWatch = () => {
  if (props.image) {
    emit('watch', props.image)
  }
}

const handleList = () => {
  if (props.image) {
    emit('list', props.image)
  }
}

const handleRegister = () => {
  if (props.image) {
    emit('register', props.image)
  }
}

// データ取得メソッド（サンプルデータ）
const getDescription = (image: ImageFile | null) => {
  if (!image) return 'No description available'
  // 実際のデータに応じて変更
  return `This is a description for ${image.name}. It contains detailed information about the NFT.`
}

const getChain = (image: ImageFile | null) => {
  if (!image) return 'Unknown'
  // 実際のデータに応じて変更
  return 'Ethereum Testnet'
}

const getMintDate = (image: ImageFile | null) => {
  if (!image) return 'Unknown'
  // 実際のデータに応じて変更
  return new Date(image.created_at).toLocaleDateString('ja-JP')
}

// 背景スクロールの制御
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const enableBodyScroll = () => {
  document.body.style.overflow = ''
}

// モーダルの表示状態を監視してスクロール制御
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    disableBodyScroll()
  } else {
    enableBodyScroll()
  }
})

// ESCキーでポップアップを閉じる
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isVisible) {
      closeModal()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    // コンポーネントが破棄される際にスクロールを復元
    enableBodyScroll()
  })
})
</script>
