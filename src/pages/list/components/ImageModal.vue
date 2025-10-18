<template>
  <!-- ポップアップモーダル -->
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="closeModal">
    
    <!-- 背景オーバーレイ -->
    <div class="absolute inset-0 bg-gray-900 bg-opacity-95"></div>
    <Transition name="fade">
      <div v-if="isFullscreen">
        <div class="absolute inset-0 bg-yellow-200 bg-opacity-10 z-10"></div>
        <div class="absolute inset-0 bg-gray-900 bg-opacity-95"></div>
      </div>
    </Transition>

    <!-- ポップアップコンテンツ -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto z-20" @click.stop>
      
      <!-- ヘッダー（閉じるボタン） -->
      <div  v-if="!isFullscreen" class="flex justify-end p-4">
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- メインコンテンツ -->
      <div class="relative">
        <!-- 通常表示（左が画像、右がテキスト） -->
        <div 
          v-if="!isFullscreen"
          class="flex flex-col lg:flex-row transition-all duration-300 ease-in-out"
        >
          <!-- 左側：画像 -->
          <div class="lg:w-1/2 p-4">
            <div 
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-none mx-auto lg:mx-0 cursor-pointer hover:opacity-90 transition-opacity"
              @click="enterFullscreen"
            >
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
            <!-- ローディング中 -->
            <div v-if="isLoadingDetails" class="flex items-center justify-center py-8">
              <svg class="size-6 animate-spin text-green-600" viewBox="0 0 24 24" fill="none">
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
              <p class="ml-2 text-gray-600">Loading...</p>
            </div>

            <!-- データ表示 -->
            <template v-else>
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

              <!-- Chain & Mint Date -->
              <div class="flex flex-col sm:flex-row sm:gap-8">
                <!-- Chain -->
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Chain</h3>
                  <p class="text-gray-700">{{ getChain(image) }}</p>
                </div>

                <!-- Mint Date -->
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Mint Date</h3>
                  <p class="text-gray-700">{{ getMintDate(image) }}</p>
                </div>
              </div>

              <!-- Tx Hash -->
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">Tx Hash</h3>
                <a 
                  v-if="getTxHash(image) !== '-'"
                  :href="getTxHashLink(image)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ getTxHashDisplay(image) }}
                </a>
                <p v-else class="text-gray-700">-</p>
              </div>
            </template>
          </div>
        </div>

        <!-- ポップアップウィンドウ 画像フルスクリーン表示 -->
        <div v-if="isFullscreen" class="p-6 transition-all duration-300 ease-in-out">
          <div 
            class="relative w-full h-[calc(70vh-100px)] flex items-center justify-center cursor-pointer"
            @click="exitFullscreen"
          >
            <img 
              v-if="image"
              :src="image.url" 
              :alt="image.name"
              class="max-w-full max-h-full object-contain transition-all duration-300 ease-in-out"
            />
          </div>
        </div>
      </div>

      <!-- ボタン（通常表示時のみ） -->
      <div v-if="!isFullscreen" class="flex justify-end gap-3 p-4 border-t border-gray-200">
        <button 
          @click="enterFullscreen"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Watch
        </button>
        <button 
          @click="closeModal"
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

// Composables
const { getImageDetails } = useImageDetails()

// フルスクリーン表示の状態管理
const isFullscreen = ref(false)

// 画像詳細情報の状態管理
const imageDetails = ref<any>(null)
const isLoadingDetails = ref(false)

// Methods
const closeModal = () => {
  isFullscreen.value = false // フルスクリーン状態をリセット
  emit('close')
}

// フルスクリーン機能
const enterFullscreen = () => {
  isFullscreen.value = true
}

const exitFullscreen = () => {
  isFullscreen.value = false
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

// DBから画像詳細情報を取得（Pinataは呼び出さない）
const loadImageDetails = async (fileName: string) => {
  isLoadingDetails.value = true
  imageDetails.value = null

  try {
    // DBから画像詳細を取得（metadata + tokensを含む）
    const result = await getImageDetails(fileName)
    
    if (result.success && result.details) {
      imageDetails.value = result.details
    }
  } catch (error) {
    console.error('画像詳細の読み込みエラー:', error)
  } finally {
    isLoadingDetails.value = false
  }
}

// データ取得メソッド
const getDescription = (image: ImageFile | null) => {
  if (!image) return 'No description available'
  
  // DBから取得したdescriptionを表示
  if (imageDetails.value?.description) {
    return imageDetails.value.description
  }
  
  return 'No description available'
}

const getChain = (image: ImageFile | null) => {
  if (!image) return '-'
  
  // metadataは配列で返されるので最初の要素を取得
  let metadata = null
  if (imageDetails.value?.metadata) {
    if (Array.isArray(imageDetails.value.metadata) && imageDetails.value.metadata.length > 0) {
      metadata = imageDetails.value.metadata[0]
    } else if (!Array.isArray(imageDetails.value.metadata)) {
      metadata = imageDetails.value.metadata
    }
  }
  
  // トークン情報からchainを取得
  const tokens = metadata && 'tokens' in metadata ? metadata.tokens : null
  if (tokens && Array.isArray(tokens) && tokens.length > 0) {
    const chain = tokens[0].chain
    
    // チェーン名を表示用に変換
    if (chain === 'sepolia') {
      return 'Ethereum(Sepolia)'
    }
    
    return chain || '-'
  }
  
  return '-'
}

const getMintDate = (image: ImageFile | null) => {
  if (!image) return '-'
  
  // metadataは配列で返されるので最初の要素を取得
  let metadata = null
  if (imageDetails.value?.metadata) {
    if (Array.isArray(imageDetails.value.metadata) && imageDetails.value.metadata.length > 0) {
      metadata = imageDetails.value.metadata[0]
    } else if (!Array.isArray(imageDetails.value.metadata)) {
      metadata = imageDetails.value.metadata
    }
  }
  
  // トークン情報からminted_atを取得
  const tokens = metadata && 'tokens' in metadata ? metadata.tokens : null
  if (tokens && Array.isArray(tokens) && tokens.length > 0 && tokens[0].minted_at) {
    return new Date(tokens[0].minted_at).toLocaleDateString('ja-JP')
  }
  
  // まだミントされていない場合
  return '-'
}

const getTxHash = (image: ImageFile | null) => {
  if (!image) return '-'
  
  // metadataは配列で返されるので最初の要素を取得
  let metadata = null
  if (imageDetails.value?.metadata) {
    if (Array.isArray(imageDetails.value.metadata) && imageDetails.value.metadata.length > 0) {
      metadata = imageDetails.value.metadata[0]
    } else if (!Array.isArray(imageDetails.value.metadata)) {
      metadata = imageDetails.value.metadata
    }
  }
  
  // トークン情報からtx_hashを取得
  const tokens = metadata && 'tokens' in metadata ? metadata.tokens : null
  
  if (tokens && Array.isArray(tokens) && tokens.length > 0 && tokens[0].tx_hash) {
    return tokens[0].tx_hash
  }
  
  // まだミントされていない場合
  return '-'
}

const getTxHashDisplay = (image: ImageFile | null) => {
  const txHash = getTxHash(image)
  if (txHash === '-') return '-'
  
  // 20文字以降は省略
  if (txHash.length > 20) {
    return txHash.substring(0, 20) + '...'
  }
  return txHash
}

const getTxHashLink = (image: ImageFile | null) => {
  const txHash = getTxHash(image)
  if (txHash === '-') return '#'
  
  return `https://sepolia.etherscan.io/tx/${txHash}`
}

// 背景スクロールの制御
const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden'
}

const enableBodyScroll = () => {
  document.body.style.overflow = ''
}

// モーダルの表示状態を監視してスクロール制御とデータ読み込み
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    disableBodyScroll()
    // 画像が選択されている場合、詳細情報を読み込む
    if (props.image?.name) {
      loadImageDetails(props.image.name)
    }
  } else {
    enableBodyScroll()
    // モーダルを閉じたときに状態をリセット
    imageDetails.value = null
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

<style scoped>
/* フェード効果の定義 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
