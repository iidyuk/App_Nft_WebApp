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
export const uploadMetadataToPinata = async (metadata: any, fileName?: string) => {
  try {
    console.log('📤 uploadMetadataToPinata開始')
    console.log('metadata:', metadata)
    console.log('fileName:', fileName)

    // 環境変数の取得・チェック
    const config = useRuntimeConfig()
    const pinataJWTKey = config.public.pinataJWTKey
    if (!pinataJWTKey) {
      console.error('❌ Pinata JWT Keyが設定されていません')
      return {
        success: false,
        message: 'Pinata JWT Keyが設定されていません',
        error: '環境変数PINATA_JWT_KEYを設定してください'
      }
    }

    // Pinataへのリクエストボディを生成
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '')
    const defaultName = `NFT Metadata-${timestamp}`
    const requestBody = {
      pinataContent: metadata,
      pinataMetadata: {
        name: fileName || metadata.name || defaultName
      }
    }
    console.log('リクエストボディ:', requestBody)

    // Pinataへのリクエストを送信
    console.log('Pinata APIへリクエスト送信中...')
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWTKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    console.log('レスポンスステータス:', response.status, response.statusText)
    
    // エラーハンドリング
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Pinataエラーレスポンス:', errorData)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()  // レスポンスデータ
    
    return {
      success: true,
      message: 'metadata uploaded to Pinata successfully',
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    }
  } catch (error) {
    console.error('Pinata JSONアップロードエラー:', error)
    return {
      success: false,
      message: 'metadata upload to Pinata failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
