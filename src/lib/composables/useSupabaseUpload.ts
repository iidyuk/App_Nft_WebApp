import { supabaseConfig } from '~/lib/external/supabase'

export const useSupabaseUpload = () => {
  const supabase = supabaseConfig()
  const isUploading = ref(false)
  // const uploadProgress = ref(0)
  const uploadedImageUrl = ref<string | null>(null)
  const uploadError = ref<string | null>(null)

  // 画像をSupabase Storageにアップロードする処理
  const uploadImage = async (file: File, bucketName: string) => {
    try {
      isUploading.value = true
      uploadError.value = null
      // uploadProgress.value = 0

      // ファイル拡張子をチェック
      const fileExtension = file.name.split('.').at(-1)?.toLowerCase()
      if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
        throw new Error('JPG/JPEG/PNGファイルのみアップロード可能です')
      }

      // uploadsフォルダ内にファイルをアップロード
      const now = new Date()
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') + '-' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0')
      const fileName = `uploads/${timestamp}_${file.name}`

      // Supabase Storageにアップロード
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',  // キャッシュを3600秒（1時間）保持
          upsert: false  // 同名ファイルが存在する場合、上書きしない
        })

      if (error) {
        console.error('Supabase Storage エラー詳細:', error)
        throw new Error(`アップロードエラー: ${error.message}`)
      }

      // アップロードされたファイルのURLを生成
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName)

      uploadedImageUrl.value = urlData.publicUrl
      // uploadProgress.value = 100

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

  // アップロード状態をリセットする処理
  const resetUploadState = () => {
    isUploading.value = false
    // uploadProgress.value = 0
    uploadedImageUrl.value = null
    uploadError.value = null
  }

  return {
    isUploading: readonly(isUploading),
    uploadError: readonly(uploadError),
    // uploadProgress: readonly(uploadProgress),
    uploadedImageUrl: readonly(uploadedImageUrl),
    uploadImage,
    resetUploadState
  }
  // readonly()関数は Vue v3 の関数 外部から値を変更できないように保護
}
