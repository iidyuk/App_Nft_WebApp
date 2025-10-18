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
        <div  :class="['text-sm', step.isActive ? 'text-green-600' : 'text-gray-300']">
          {{ step.number }}
        </div>
        <span :class="['text-sm', step.isActive ? 'text-green-600' : 'text-gray-300']">
          {{ step.title }}
        </span>
      </div>
    </div>

    <!-- 画像選択・アップロード用コンポーネント @はv-on :はv-bind -->
    <ImageSelector 
      ref="imageSelectorRef"
      @image-selected="handleImageSelected"
    >
      <template #upload-section>
        <ImageUploader 
          v-if="selectedFile"
          :selected-file="selectedFile"
          :selected-file-name="selectedFileName"
          :is-metadata-uploaded="!!metadataUploadResult?.success"
          :has-existing-metadata="hasExistingMetadata"
          :is-already-uploaded="isFromListPage"
          :is-nft-created="nftMintCompleted"
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
      @nft-minted="handleNFTMinted"
    />

    <NuxtLink to="/" class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition mt-8">Top Page</NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import ImageSelector from './components/ImageSelector.vue'
  import ImageUploader from './components/ImageUploader.vue'
  import MetadataUploader from './components/MetadataUploader.vue'
  import NFTMinter from './components/NFTMinter.vue'
  import { supabaseConfig } from '~/lib/external/supabase'

  // composables
  const { saveMetadataByImagePath } = useMetadataDB()
  const { getImageDetails } = useImageDetails()
  const route = useRoute()

  // 認証が必要なページとして設定
  definePageMeta({
    middleware: 'auth'
  })

  // ref() 変数の定義
  const selectedFile = ref<File | null>(null)  // 画像ファイル
  const selectedImageUrl = ref<string>('')  // 画像の一時的なURL
  const selectedFileName = ref<string>('')  // 選択されたファイル名
  const uploadedImageInfo = ref<{ url: string; fileName: string; description?: string } | null>(null)  // 画像のURL(supabase)
  const metadataUploadResult = ref<{ success: boolean; url?: string; hash?: string; message: string; error?: string } | null>(null)  // メタデータアップロード結果
  const statusMessage = ref<string>('')  // ステータスメッセージ
  const statusMessageType = ref<'success' | 'error' | 'info'>('info')  // ステータスメッセージのタイプ
  const metadataUploadRequested = ref<boolean>(false)  // メタデータアップロード要求フラグ
  const nftCreationRequested = ref<boolean>(false)  // NFT作成要求フラグ
  const imageSelectorRef = ref<InstanceType<typeof ImageSelector> | null>(null)  // ImageSelectorコンポーネントへの参照
  const hasExistingMetadata = ref<boolean>(false)  // DBに既存メタデータがあるかどうか
  const isFromListPage = ref<boolean>(false)  // Listページから遷移したかどうか
  const nftMintCompleted = ref<boolean>(false)  // NFTミント完了フラグ

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
  }

  // 画像アップロード完了時の処理
  const handleImageUploaded = async (url: string, fileName: string) => {
    // imagesテーブルからdescriptionを取得
    const supabase = supabaseConfig()
    const { data: imageData } = await supabase
      .from('images')
      .select('description')
      .eq('file_name', fileName)
      .single()
    
    uploadedImageInfo.value = { 
      url, 
      fileName,
      description: imageData?.description || undefined
    }  // アップロード済みの画像情報
    // ステップ2をアクティブにする
    steps.value[1].isActive = true
  }

  // NFT作成要求の処理
  const handleNFTCreationRequested = () => {
    nftCreationRequested.value = true
    // ステップ3をアクティブにする
    steps.value[2].isActive = true
  }

  // NFTミント完了時の処理
  const handleNFTMinted = (result: { success: boolean; transactionHash?: string; tokenId?: string; error?: string }) => {
    if (result.success) {
      nftMintCompleted.value = true
      handleStatusMessage(`NFTを発行しました！ Token ID: ${result.tokenId}`, 'success')
    } else {
      handleStatusMessage(`NFT発行エラー: ${result.error}`, 'error')
    }
    
    // ミント要求フラグをリセット
    nftCreationRequested.value = false
  }

  // メタデータアップロード要求の処理
  const handleMetadataUploadRequested = () => {
    metadataUploadRequested.value = true
    // ステップ2をアクティブにする
    steps.value[1].isActive = true
  }

  // メタデータアップロード完了時の処理
  const handleMetadataUploaded = async (result: { success: boolean; url?: string; hash?: string; message: string; error?: string }) => {
    metadataUploadResult.value = result
    metadataUploadRequested.value = false  // 要求フラグをリセット
    
    if (result.success && result.hash && result.url && uploadedImageInfo.value) {
      // DBにメタデータを保存
      const dbResult = await saveMetadataByImagePath(
        uploadedImageInfo.value.fileName,  // ファイル名（file_name）
        result.hash,  // pinata_cid
        result.url    // pinata_url
      )
      
      if (dbResult.success) {
        handleStatusMessage('メタデータをDBに保存しました', 'success')
        // ステップ3をアクティブにする
        steps.value[2].isActive = true
      } else {
        handleStatusMessage(`DB保存エラー: ${dbResult.error}`, 'error')
      }
    } else if (result.success) {
      // ステップ3をアクティブにする（DB保存は行わない）
      steps.value[2].isActive = true
    }
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
        return 'bg-green-100 border border-green-400 text-green-700'
      default:
        return 'bg-gray-100 border border-gray-400 text-gray-700'
    }
  }

  // URLからFileオブジェクトを作成
  const createFileFromUrl = async (url: string, fileName: string): Promise<File | null> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new File([blob], fileName, { type: blob.type })
    } catch (error) {
      console.error('画像の読み込みエラー:', error)
      return null
    }
  }

  // クエリパラメータから画像情報を読み込み
  const loadImageFromQuery = async () => {
    const fromList = route.query.fromList as string
    const imageUrl = route.query.imageUrl as string
    const imageName = route.query.imageName as string

    if (fromList === 'true' && imageUrl && imageName) {
      isFromListPage.value = true
      hasExistingMetadata.value = false  // 初期状態にリセット
      
      // 画像をFileオブジェクトに変換
      const file = await createFileFromUrl(imageUrl, imageName)
      if (!file) {
        handleStatusMessage('画像の読み込みに失敗しました', 'error')
        return
      }

      // ImageSelectorの状態を更新
      if (imageSelectorRef.value) {
        imageSelectorRef.value.selectedImage = imageUrl
        imageSelectorRef.value.selectedFileName = imageName
        imageSelectorRef.value.selectedFile = file
      }

      // 画像選択ハンドラーを呼び出す
      handleImageSelected(file, imageUrl)

      // Listページから遷移した場合、画像は既にSupabaseにアップロード済み
      // DBから画像情報を取得
      const supabase = supabaseConfig()
      const { data: imageData } = await supabase
        .from('images')
        .select('description')
        .eq('file_name', imageName)
        .single()
      
      // アップロード済み状態として設定（メタデータの有無に関わらず）
      uploadedImageInfo.value = { 
        url: imageUrl, 
        fileName: imageName,
        description: imageData?.description || undefined
      }
      
      // ステップ2をアクティブにする（画像アップロード完了済み）
      steps.value[1].isActive = true

      // DBから既存のメタデータ情報を確認
      const result = await getImageDetails(imageName)
      
      if (result.success && result.details) {
        // メタデータが配列で返される場合
        let metadata = null
        if (result.details.metadata) {
          if (Array.isArray(result.details.metadata)) {
            // 配列の場合、要素があれば最初の要素を取得
            metadata = result.details.metadata.length > 0 ? result.details.metadata[0] : null
          } else {
            // 配列でない場合はそのまま使用
            metadata = result.details.metadata
          }
        }

        // metadataが存在し、かつ空のオブジェクトでない場合
        if (metadata && Object.keys(metadata).length > 0) {
          hasExistingMetadata.value = true
          
          // メタデータがある場合、ステップ3もアクティブにする
          if ('pinata_url' in metadata && metadata.pinata_url) {
            metadataUploadResult.value = {
              success: true,
              url: metadata.pinata_url,
              message: '既存のメタデータが読み込まれました'
            }
            steps.value[2].isActive = true
          }
          
          // Mint完了チェック：tokensテーブルに情報があるか確認
          const tokens = metadata && 'tokens' in metadata ? metadata.tokens : null
          
          if (tokens && Array.isArray(tokens) && tokens.length > 0) {
            // tokenが存在する場合、既にミント済み
            nftMintCompleted.value = true
            handleStatusMessage('この画像は既にNFTとして記録されています', 'info')
          } else {
            nftMintCompleted.value = false
          }
        }
      }
    }
  }

  // コンポーネントマウント時にクエリパラメータをチェック
  onMounted(() => {
    loadImageFromQuery()
  })

  // 環境変数のテスト
  // const config = useRuntimeConfig()
  // console.log(' runtimeConfig.public ')
  // console.log('supabaseUrl:', config.public.supabaseUrl)
  // console.log('supabaseAnonKey:', config.public.supabaseAnonKey)
</script>