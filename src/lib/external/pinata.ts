// Pinata API接続チェック関数
export const checkPinataConnection = async () => {
  try {
    const config = useRuntimeConfig()
    const pinataJWTKey = config.public.pinataJWTKey
    
    if (!pinataJWTKey) {
      return {
        success: false,
        message: 'Pinata JWT Keyが設定されていません',
        error: '環境変数PINATA_JWT_KEYを設定してください'
      }
    }

    // Pinata APIの認証テストエンドポイントに接続
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWTKey}`,
        'Accept': 'application/json' // acceptヘッダーを追加
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    
    return {
      success: true,
      message: result.message || 'Pinata API接続成功', // 成功メッセージを使用
      // userInfoは不要になるため削除
    }
  } catch (error) {
    console.error('Pinata API接続エラー:', error)
    return {
      success: false,
      message: 'Pinata API接続失敗',
      error: error instanceof Error ? error.message : String(error)
    }
  }
} 

// JSONメタデータをPinataにアップロードする関数
export const uploadMetadataToPinata = async (metadata: any) => {
  try {
    const config = useRuntimeConfig()
    const pinataJWTKey = config.public.pinataJWTKey
    
    if (!pinataJWTKey) {
      return {
        success: false,
        message: 'Pinata JWT Keyが設定されていません',
        error: '環境変数PINATA_JWT_KEYを設定してください'
      }
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWTKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    
    return {
      success: true,
      message: 'JSONメタデータアップロード成功',
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    }
  } catch (error) {
    console.error('Pinata JSONアップロードエラー:', error)
    return {
      success: false,
      message: 'JSONメタデータアップロード失敗',
      error: error instanceof Error ? error.message : String(error)
    }
  }
} 