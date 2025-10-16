<template>
  <!-- ローディング状態 -->
  <div v-if="isLoading" class="py-8">
    <Spinner />
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
            <!-- Ethereum / Sepolia -->
            <svg 
              v-if="getChainForImage(image.name) === 'ethereum' || getChainForImage(image.name) === 'sepolia'"
              class="w-6 h-6"
              viewBox="0 0 256 417"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#343434" d="m127.961 0-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
              <path fill="#8C8C8C" d="M127.962 0 0 212.32l127.962 75.639V154.158z"/>
              <path fill="#3C3C3B" d="m127.961 312.187-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
              <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
              <path fill="#141414" d="m127.961 287.958 127.96-75.637-127.96-58.162z"/>
              <path fill="#393939" d="m.001 212.321 127.96 75.637V154.159z"/>
            </svg>
            <!-- Polygon -->
            <svg 
              v-else-if="getChainForImage(image.name) === 'polygon'"
              class="w-6 h-6"
              viewBox="0 0 38.4 33.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#8247E5" d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3 c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7 c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7 c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1 L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7 c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"/>
            </svg>
            <!-- その他 -->
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
import Spinner from '~/lib/asset/animation/Spinner.vue'
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
