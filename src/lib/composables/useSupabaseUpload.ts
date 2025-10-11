import { useSupabaseConfig } from '~/lib/external/supabase'

export const useSupabaseUpload = () => {
  const supabase = useSupabaseConfig()
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadedImageUrl = ref<string | null>(null)
  const uploadError = ref<string | null>(null)

  // 画像をSupabase Storageにアップロード
  const uploadImage = async (file: File, bucketName: string = 'images') => {
    try {
      isUploading.value = true
      uploadError.value = null
      uploadProgress.value = 0

      // ファイル拡張子をチェック
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
        throw new Error('JPG/JPEG/PNGファイルのみアップロード可能です')
      }

      // uploadsフォルダ内にファイルをアップロード
      const timestamp = Date.now()
      const fileName = `uploads/${timestamp}_${file.name}`

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase Storage エラー詳細:', error)
        throw new Error(`アップロードエラー: ${error.message}`)
      }

      // アップロードされたファイルのURLを取得
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      uploadedImageUrl.value = urlData.publicUrl
      uploadProgress.value = 100

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: fileName
      }

    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : 'アップロードに失敗しました'
      return {
        success: false,
        error: uploadError.value
      }
    } finally {
      isUploading.value = false
    }
  }

  // アップロード状態をリセット
  const resetUploadState = () => {
    isUploading.value = false
    uploadProgress.value = 0
    uploadedImageUrl.value = null
    uploadError.value = null
  }

  return {
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    uploadedImageUrl: readonly(uploadedImageUrl),
    uploadError: readonly(uploadError),
    uploadImage,
    resetUploadState
  }
} 