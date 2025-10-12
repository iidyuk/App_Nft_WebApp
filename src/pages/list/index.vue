<template>
  <div class="max-w-6xl mx-auto mt-20 p-8 bg-white rounded-lg shadow">
    <h1 class="text-3xl font-bold text-blue-600 text-center">List</h1>

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">画像を読み込み中...</p>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-8">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p class="font-bold">エラーが発生しました</p>
        <p class="text-sm">{{ errorMessage }}</p>
      </div>
      <button 
        @click="fetchImages" 
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

      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 300px)); justify-content: center;">
        <div 
          v-for="image in images" 
          :key="image.url"
          class="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          style="width: 100%; min-width: 80px; max-width: 240px;"
        >
          <!-- 画像 -->
          <div class="w-full bg-gray-200 flex items-center justify-center" style="aspect-ratio: auto;">
            <p class="mb-2">
              <img 
                :src="image.url" 
                :alt="image.name"
                class="w-full h-auto object-cover rounded-t"
                @error="handleImageError"
              />
            </p>
          </div>
          
        </div>
      </div>
    </div>

    <!-- トップページへのリンク -->
    <div class="text-center mt-8">
      <NuxtLink 
        to="/" 
        class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
      >
        Top Page
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

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

// リアクティブ変数
const images = ref<ImageFile[]>([])
const isLoading = ref(false)
const error = ref(false)
const errorMessage = ref<string>('')

// Supabaseクライアントの初期化（接続設定）
const config = useRuntimeConfig()  // Nuxt.jsの設定取得関数
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseAnonKey
)

// 画像一覧を取得する関数
const fetchImages = async () => {
  isLoading.value = true
  error.value = false
  errorMessage.value = ''
  
  try {
    console.log('画像一覧取得開始...')
    
    // SupabaseのStorage-imagesバケット-uploadsフォルダからファイル一覧を取得
    const { data: files, error: fetchError } = await supabase
      .storage
      .from('images')
      .list('uploads', { 
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (fetchError) {
      console.error('ファイル一覧取得エラー:', fetchError)
      throw new Error(`ファイル一覧の取得に失敗しました: ${fetchError.message}`)
    }

    if (!files || files.length === 0) {
      console.log('ファイルが見つかりませんでした')
      images.value = []
      return
    }

    console.log(`取得したファイル数: ${files.length}`)
    console.log('ファイル一覧:', files.map(f => f.name))

    // JPG/JPEGファイルのみをフィルタリング
    const imageFiles = files.filter(file => {
      const extension = file.name.split('.').at(-1)?.toLowerCase()
      return extension === 'jpg' || extension === 'jpeg' || extension === 'png'
    })

    console.log(`画像ファイル数: ${imageFiles.length}`)

    // 各ファイルのパブリックURLを生成
    images.value = imageFiles.map(file => {
      const filePath = `uploads/${file.name}`
      const { data: urlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath)

      console.log(`Generated URL for ${file.name}:`, urlData.publicUrl)

      return {
        name: file.name,
        url: urlData.publicUrl,
        updated_at: file.updated_at,
        created_at: file.created_at,
        metadata: file.metadata
      } as ImageFile
    })

    console.log(`表示する画像数: ${images.value.length}`)

  } catch (err) {
    error.value = true
    errorMessage.value = err instanceof Error ? err.message : '予期しないエラーが発生しました'
    console.error('画像一覧取得エラー:', err)
  } finally {
    isLoading.value = false
  }
}

// 画像読み込みエラーの処理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial, sans-serif" font-size="14">画像を読み込めません</text></svg>'
}

// コンポーネントマウント（DOM要素すなわちHTML構造の作成・配置）（描画前）直後に画像一覧を取得
onMounted(() => {
  fetchImages()
})
</script>
