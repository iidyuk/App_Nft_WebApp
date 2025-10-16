import { supabaseConfig } from '~/lib/external/supabase'

/**
 * メタデータのDB操作を行うcomposable
 */
export const useMetadataDB = () => {
  const supabase = supabaseConfig()

  /**
   * 画像パス（またはファイル名）からimagesテーブルのIDを取得
   * @param imagePath - Storage内の画像パスまたはファイル名
   */
  const getImageIdByPath = async (imagePath: string) => {
    try {
      console.log('🔍 画像ID検索開始:', imagePath)
      
      // まずfile_nameで検索（ファイル名のみの場合）
      let { data, error } = await supabase
        .from('images')
        .select('id')
        .eq('file_name', imagePath)
        .single()

      // file_nameで見つからなければimage_pathで検索（フルパスの場合）
      if (error && error.code === 'PGRST116') {
        console.log('file_nameで見つからなかったため、image_pathで再検索')
        const result = await supabase
          .from('images')
          .select('id')
          .eq('image_path', imagePath)
          .single()
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('❌ 画像ID検索エラー:', error)
        throw error
      }

      console.log('✅ 画像ID取得成功:', data?.id)
      return { success: true, imageId: data?.id }
    } catch (error) {
      console.error('画像ID取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '画像IDの取得に失敗しました' 
      }
    }
  }

  /**
   * metadataテーブルにレコードを保存
   * @param imageId - imagesテーブルのID
   * @param pinataCid - PinataのCID
   * @param pinataUrl - PinataのURL
   */
  const saveMetadata = async (imageId: string, pinataCid: string, pinataUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .insert({
          image_id: imageId,
          pinata_cid: pinataCid,
          pinata_url: pinataUrl
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { 
        success: true, 
        metadata: data,
        message: 'メタデータをDBに保存しました' 
      }
    } catch (error) {
      console.error('メタデータ保存エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'メタデータの保存に失敗しました' 
      }
    }
  }

  /**
   * 画像パスとPinata情報からメタデータを保存
   * @param imagePath - Storage内の画像パス
   * @param pinataCid - PinataのCID
   * @param pinataUrl - PinataのURL
   */
  const saveMetadataByImagePath = async (imagePath: string, pinataCid: string, pinataUrl: string) => {
    try {
      // 画像IDを取得
      const imageResult = await getImageIdByPath(imagePath)
      
      if (!imageResult.success || !imageResult.imageId) {
        throw new Error(imageResult.error || '画像IDが見つかりません')
      }

      // metadataテーブルに保存
      return await saveMetadata(imageResult.imageId, pinataCid, pinataUrl)
      
    } catch (error) {
      console.error('メタデータ保存エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'メタデータの保存に失敗しました' 
      }
    }
  }

  /**
   * 画像IDに紐づくメタデータを取得
   * @param imageId - imagesテーブルのID
   */
  const getMetadataByImageId = async (imageId: string) => {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .eq('image_id', imageId)
        .single()

      if (error) {
        throw error
      }

      return { success: true, metadata: data }
    } catch (error) {
      console.error('メタデータ取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'メタデータの取得に失敗しました' 
      }
    }
  }

  return {
    getImageIdByPath,
    saveMetadata,
    saveMetadataByImagePath,
    getMetadataByImageId
  }
}

