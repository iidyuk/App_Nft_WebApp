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
        <div class="relative w-full bg-gray-200 flex items-center justify-center">
          <img 
            :src="image.url" 
            :alt="image.name"
            class="w-full h-auto object-cover rounded-t"
            @error="handleImageError"
          />
          <!-- ブロックチェーンロゴ（ミント済みの場合のみ表示） -->
          <div 
            v-if="getChainForImage(image.name)" 
            class="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-lg"
            :title="`Minted on ${getChainForImage(image.name)}`"
          >
            <img 
              v-if="getChainForImage(image.name) === 'sepolia'"
              src="https://cryptologos.cc/logos/ethereum-eth-logo.svg"
              alt="Ethereum"
              class="w-6 h-6"
            />
            <img 
              v-else-if="getChainForImage(image.name) === 'polygon'"
              src="https://cryptologos.cc/logos/polygon-matic-logo.svg"
              alt="Polygon"
              class="w-6 h-6"
            />
            <div 
              v-else
              class="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700"
            >
              ?
            </div>
          </div>
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

// Composables
const { getImageDetails } = useImageDetails()

// ポップアップの状態管理
const showPopup = ref(false)
const selectedImage = ref<ImageFile | null>(null)

// 画像のチェーン情報を保存するマップ
const imageChainMap = ref<Map<string, string>>(new Map())

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
  // registrationページへ遷移し、画像情報をクエリパラメータで渡す
  const router = useRouter()
  router.push({
    path: '/registration',
    query: {
      imageUrl: image.url,
      imageName: image.name,
      fromList: 'true'
    }
  })
}

// 画像のチェーン情報を取得
const fetchChainInfo = async (fileName: string) => {
  try {
    const result = await getImageDetails(fileName)
    
    if (result.success && result.details) {
      // metadataは配列で返されるので最初の要素を取得
      let metadata = null
      if (result.details.metadata) {
        if (Array.isArray(result.details.metadata) && result.details.metadata.length > 0) {
          metadata = result.details.metadata[0]
        } else if (!Array.isArray(result.details.metadata)) {
          metadata = result.details.metadata
        }
      }
      
      // トークン情報からchainを取得
      const tokens = metadata && 'tokens' in metadata ? metadata.tokens : null
      if (tokens && Array.isArray(tokens) && tokens.length > 0 && tokens[0].chain) {
        imageChainMap.value.set(fileName, tokens[0].chain)
      }
    }
  } catch (error) {
    console.error(`チェーン情報取得エラー (${fileName}):`, error)
  }
}

// 画像のチェーン情報を取得する関数
function getChainForImage(fileName: string): string | null {
  return imageChainMap.value.get(fileName) || null
}

// paginatedImagesが変更されたときにチェーン情報を取得
watch(() => props.paginatedImages, async (newImages) => {
  if (newImages && newImages.length > 0) {
    // 各画像のチェーン情報を並列で取得
    await Promise.all(
      newImages.map(image => fetchChainInfo(image.name))
    )
  }
}, { immediate: true })
</script>
