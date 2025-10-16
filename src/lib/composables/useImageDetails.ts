import { supabaseConfig } from '~/lib/external/supabase'

/**
 * 画像の詳細情報（メタデータとトークン情報）を取得するcomposable
 */
export const useImageDetails = () => {
  const supabase = supabaseConfig()

  /**
   * 画像ファイル名から詳細情報を取得
   * @param fileName - 画像ファイル名
   */
  const getImageDetails = async (fileName: string) => {
    try {
      // imagesテーブルから画像情報を取得し、関連するメタデータとトークン情報をJOINで取得
      const { data, error } = await supabase
        .from('images')
        .select(`
          id,
          file_name,
          description,
          created_at,
          metadata (
            id,
            pinata_url,
            created_at,
            tokens (
              chain,
              minted_at,
              token_id,
              tx_hash
            )
          )
        `)
        .eq('file_name', fileName)
        .single()

      if (error) {
        // レコードが見つからない場合は正常として扱う
        if (error.code === 'PGRST116') {
          return { 
            success: true, 
            details: null,
            message: '画像がDBに登録されていません' 
          }
        }
        throw error
      }

      return { 
        success: true, 
        details: data 
      }
    } catch (error) {
      console.error('画像詳細取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '画像詳細の取得に失敗しました',
        details: null
      }
    }
  }

  /**
   * Pinataからメタデータ（JSON）を取得
   * @param pinataUrl - PinataのURL
   */
  const fetchMetadataFromPinata = async (pinataUrl: string) => {
    try {
      const response = await fetch(pinataUrl)
      if (!response.ok) {
        throw new Error(`Pinataからのメタデータ取得に失敗: ${response.status}`)
      }
      const metadata = await response.json()
      return { 
        success: true, 
        metadata 
      }
    } catch (error) {
      console.error('Pinataメタデータ取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'メタデータの取得に失敗しました',
        metadata: null
      }
    }
  }

  return {
    getImageDetails,
    fetchMetadataFromPinata
  }
}

