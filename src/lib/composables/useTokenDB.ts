import { supabaseConfig } from '~/lib/external/supabase'

/**
 * NFTトークンのDB操作を行うcomposable
 */
export const useTokenDB = () => {
  const supabase = supabaseConfig()

  /**
   * メタデータURLからmetadataテーブルのIDを取得
   * @param pinataUrl - PinataのURL
   */
  const getMetadataIdByUrl = async (pinataUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('id')
        .eq('pinata_url', pinataUrl)
        .single()

      if (error) {
        throw error
      }

      return { success: true, metadataId: data?.id }
    } catch (error) {
      console.error('metadata ID取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'metadata IDの取得に失敗しました' 
      }
    }
  }

  /**
   * tokensテーブルにNFT情報を保存
   * @param params - NFT情報
   */
  const saveToken = async (params: {
    metadataId: string
    tokenId: string
    tokenUri: string
    txHash: string
    contractAddress: string
    chain: string
    minterAddress: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          metadata_id: params.metadataId,
          token_id: params.tokenId,
          token_uri: params.tokenUri,
          tx_hash: params.txHash,
          contract_address: params.contractAddress,
          chain: params.chain,
          minter_address: params.minterAddress
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { 
        success: true, 
        token: data,
        message: 'NFT情報をDBに保存しました' 
      }
    } catch (error) {
      console.error('NFT情報保存エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'NFT情報の保存に失敗しました' 
      }
    }
  }

  /**
   * メタデータURLとmint情報からトークンを保存
   * @param metadataUrl - メタデータのPinata URL
   * @param tokenId - NFTのトークンID
   * @param txHash - トランザクションハッシュ
   * @param contractAddress - コントラクトアドレス
   * @param chain - チェーン名
   * @param minterAddress - ミンターアドレス
   */
  const saveTokenByMetadataUrl = async (
    metadataUrl: string,
    tokenId: string,
    txHash: string,
    contractAddress: string,
    chain: string,
    minterAddress: string
  ) => {
    try {
      // metadata IDを取得
      const metadataResult = await getMetadataIdByUrl(metadataUrl)
      
      if (!metadataResult.success || !metadataResult.metadataId) {
        throw new Error(metadataResult.error || 'metadata IDが見つかりません')
      }

      // tokensテーブルに保存
      return await saveToken({
        metadataId: metadataResult.metadataId,
        tokenId: tokenId,
        tokenUri: metadataUrl,
        txHash: txHash,
        contractAddress: contractAddress,
        chain: chain,
        minterAddress: minterAddress
      })
      
    } catch (error) {
      console.error('NFT情報保存エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'NFT情報の保存に失敗しました' 
      }
    }
  }

  /**
   * トランザクションハッシュからトークン情報を取得
   * @param txHash - トランザクションハッシュ
   */
  const getTokenByTxHash = async (txHash: string) => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('tx_hash', txHash)
        .single()

      if (error) {
        throw error
      }

      return { success: true, token: data }
    } catch (error) {
      console.error('トークン情報取得エラー:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'トークン情報の取得に失敗しました' 
      }
    }
  }

  return {
    getMetadataIdByUrl,
    saveToken,
    saveTokenByMetadataUrl,
    getTokenByTxHash
  }
}

