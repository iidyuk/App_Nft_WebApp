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

      // 現在のユーザーIDを取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // ユーザーIDフォルダ内にファイルをアップロード
      const now = new Date()
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') + '-' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0')
      
      // Storage内のフルパス（ユーザーID/タイムスタンプ_ファイル名）
      const storagePath = `${user.id}/${timestamp}_${file.name}`
      // DBやPinataで使用するファイル名（タイムスタンプ_ファイル名）
      const displayFileName = `${timestamp}_${file.name}`

      // Supabase Storageにアップロード
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          cacheControl: '3600',  // キャッシュを3600秒（1時間）保持
          upsert: false  // 同名ファイルが存在する場合、上書きしない
        })

      if (error) {
        console.error('Supabase Storage エラー:', error.message)

        // エラーメッセージを解析して、日本語のユーザーフレンドリーなメッセージに変換
        let userMessage = `Upload Error: ${error.message}`
        
        // エラーメッセージの文字列を取得（error.message または error 自体）
        const errorText = String(error.message || error).toLowerCase()
        
        // エラーパターンに応じて適切な日本語メッセージを設定
        if (errorText.includes('daily upload limit') || 
            errorText.includes('upload limit exceeded') ||
            errorText.includes('limit exceeded')) {
          // 1日のアップロード制限エラー
          userMessage = '1日のアップロード制限に達しました'
        } else if (errorText.includes('already exists') || errorText.includes('duplicate')) {
          // ファイル重複エラー
          userMessage = '同じ名前のファイルが既に存在します'
        } else if (errorText.includes('payload too large') || 
                   errorText.includes('file size') || 
                   errorText.includes('size limit') ||
                   errorText.includes('entity too large')) {
          // ファイルサイズ超過エラー
          userMessage = '50MB以下のファイルを選択してください'
        } else if (errorText.includes('invalid file type') || 
                   errorText.includes('mime type') ||
                   errorText.includes('file type not allowed')) {
          // ファイルタイプエラー
        //   userMessage = 'このファイル形式はサポートされていません。JPG/JPEG/PNG形式のファイルを選択してください。'
        // } else if (errorText.includes('file name') || 
        //            errorText.includes('filename') ||
        //            errorText.includes('invalid name')) {
          // ファイル名エラー
          userMessage = 'ファイル名が無効です。特殊文字や長すぎるファイル名は使用できません'
        } else if (errorText.includes('permission') || 
                   errorText.includes('unauthorized') ||
                   errorText.includes('forbidden')) {
          // 権限エラー
          userMessage = 'アップロードする権限がありません。'
        } else if (errorText.includes('bucket') || errorText.includes('not found')) {
          // バケットエラー
          userMessage = 'アップロード先が見つかりません。管理者にお問い合わせください。'
        } else if (errorText.includes('network') || errorText.includes('timeout')) {
          // ネットワークエラー
          userMessage = 'ネットワークエラーが発生しました。接続を確認して再度お試しください'
        }
        
        throw new Error(userMessage)
      }

      // アップロードされたファイルのURLを生成
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath)

      uploadedImageUrl.value = urlData.publicUrl
      // uploadProgress.value = 100

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: displayFileName  // タイムスタンプ付きファイル名のみ返却
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
