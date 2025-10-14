<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-center my-10">List</h1>

    <!-- 画像グリッド -->
    <ImageGrid
      :is-loading="isLoading"
      :error="error"
      :error-message="errorMessage"
      :images="images"
      :paginated-images="paginatedImages"
      @retry="fetchImages"
    />
    
    <!-- ページネーション -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="images.length"
      :items-per-page="itemsPerPage"
      @page-change="handlePageChange"
    />
    
    <!-- トップページへのリンク -->
    <div class="text-center my-10">
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
  import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
  import { createClient } from '@supabase/supabase-js'
  import Pagination from './components/Pagination.vue'
  import ImageGrid from './components/ImageGrid.vue'

  // 認証が必要なページとして設定
  definePageMeta({
    middleware: 'auth'
  })

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
  
  // ページネーション用の変数
  const currentPage = ref(1)
  const windowWidth = ref(0)
  
  // レスポンシブ対応のitemsPerPage
  const itemsPerPage = computed(() => {
    return windowWidth.value <= 500 ? 5 : 10
  })

  // Supabaseクライアントの初期化（接続設定）
  const config = useRuntimeConfig()  // Nuxt.jsの設定取得関数
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // ページネーション用のcomputed properties
  const totalPages = computed(() => {
    return Math.ceil(images.value.length / itemsPerPage.value)
  })

  const paginatedImages = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    const endIndex = startIndex + itemsPerPage.value
    return images.value.slice(startIndex, endIndex)
  })

  // 画面幅の更新関数
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }

  // itemsPerPageが変更されたときに現在のページを調整
  const adjustCurrentPage = () => {
    const newTotalPages = Math.ceil(images.value.length / itemsPerPage.value)
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
      currentPage.value = newTotalPages
    }
  }

  // itemsPerPageの変更を監視してページを調整
  watch(itemsPerPage, () => {
    adjustCurrentPage()
  })


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

  // ページネーション用のメソッド
  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  // コンポーネントマウント（DOM要素すなわちHTML構造の作成・配置）（描画前）直後に画像一覧を取得
  onMounted(() => {
    // 初期画面幅を設定
    updateWindowWidth()
    // リサイズイベントリスナーを追加
    window.addEventListener('resize', updateWindowWidth)
    // 画像一覧を取得
    fetchImages()
  })

  // コンポーネントアンマウント時にイベントリスナーを削除
  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
  })
</script>
