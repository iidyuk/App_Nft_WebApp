<template>
  <!-- NFT発行処理中の表示 -->
  <div v-if="isMintingNFT" class="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
    <h3 class="text-lg font-medium text-purple-800 mb-4">NFT発行</h3>
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
      <p class="text-purple-700">NFTを発行中...</p>
    </div>
  </div>

  <!-- NFT発行完了時の表示 -->
  <div v-else-if="mintingResult" class="mt-4 p-4 rounded-lg" :class="mintingResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
    <h3 class="text-lg font-medium mb-4">NFT発行</h3>
    <h4 class="font-semibold mb-2">{{ mintingResult.success ? 'NFTを発行しました' : 'NFTの発行に失敗しました' }}</h4>

    <div v-if="mintingResult.success" class="text-sm">
      <p><strong>トランザクションハッシュ:</strong> 
        <a
          :href="`https://sepolia.etherscan.io/tx/${mintingResult.transactionHash}`"
          target="_blank" class="text-blue-600 hover:underline break-all">{{ mintingResult.transactionHash }}
        </a>
      </p>
    </div>
    
    <div v-if="!mintingResult.success" class="text-sm">
      <p><strong>エラー:</strong> {{ mintingResult.error }}</p>
      <button 
        @click="retryMint" 
        class="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
      >
        再試行
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineEmits, watch } from 'vue'
  import { ethers } from 'ethers'
  import { MyNFT_ABI } from '~/lib/contracts/MyNFT_ABI'  // コントラクトのインターフェース定義

  const props = defineProps({
    metadataUrl: {
      type: String,
      required: true
    },
    mintRequested: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits<{
    statusMessage: [message: string, type: 'success' | 'error' | 'info']
    nftMinted: [result: { success: boolean; transactionHash?: string; tokenId?: string; error?: string }]
  }>()

  // composables
  const { saveTokenByMetadataUrl } = useTokenDB()

  const isMintingNFT = ref(false)
  const mintingResult = ref<any>(null)

  // 環境変数からコントラクトアドレスを取得
  const config = useRuntimeConfig()
  const CONTRACT_ADDRESS = config.public.nftContractAddress

  // ステータスメッセージをemitする関数
  const emitStatusMessage = (message: string, type: 'success' | 'error' | 'info') => {
    emit('statusMessage', message, type)
  }

  const mintNFT = async () => {

    // メタデータURLのチェック
    if (!props.metadataUrl) {
      emitStatusMessage('メタデータURLがありません。先にメタデータをアップロードしてください。', 'error')
      return
    }

    // コントラクトアドレスのチェック
    if (!CONTRACT_ADDRESS) {
      emitStatusMessage('NFTコントラクトアドレスが設定されていません', 'error')
      return
    }

    isMintingNFT.value = true  // NFT発行処理の状態
    mintingResult.value = null  // NFT発行結果の情報
    emitStatusMessage('NFTを発行中...', 'info')

    try {
      // MetaMaskなどのウォレットプロバイダに接続
      // @ts-ignore
      if (!window.ethereum) {
        emitStatusMessage('MetaMask (またはWeb3ウォレット) がインストールされていません。', 'error')
        isMintingNFT.value = false
        return
      }

      // ウォレットプロバイダに接続
      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum)  // ウォレットプロバイダのインスタンス  // アプリとチェーンを接続するためのインターフェイス
      await provider.send("eth_requestAccounts", []) // ウォレットに接続を要求
      const signer = provider.getSigner() // 署名者（トランザクション送信者）のオブジェクトを取得  // トランザクションの送信、署名、ガス代の支払いが可能
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT_ABI, signer)  // コントラクトのインスタンス
      const userAddress = await signer.getAddress()  // 署名者のアドレス（NFTを受け取るユーザーのウォレットアドレス）
      const metadataUri = props.metadataUrl
      console.log(`NFTをミント中... To: ${userAddress}, URI: ${metadataUri}`)
      const transaction = await contract.mint(userAddress, metadataUri)  // NFT発行処理（トランザクション送信）
      console.log('トランザクションを送信しました:', transaction.hash)
      const receipt = await transaction.wait() // トランザクションが承認されるのを待つ
      console.log('トランザクション承認済み:', transaction.hash)
      
      // イベントからtoken_idを取得
      let tokenId = 'unknown'
      try {
        // Transfer イベントを探す（ERC721標準）
        const transferEvent = receipt.events?.find((e: any) => e.event === 'Transfer')
        if (transferEvent && transferEvent.args) {
          // tokenIdは通常3番目の引数（from, to, tokenId）
          tokenId = transferEvent.args[2]?.toString() || transferEvent.args.tokenId?.toString()
          console.log('取得したtoken_id:', tokenId)
        }
      } catch (error) {
        console.warn('token_idの取得に失敗:', error)
      }
      
      // DBに保存
      console.log('NFT情報をDBに保存中...')
      const dbResult = await saveTokenByMetadataUrl(
        metadataUri,          // metadata_url
        tokenId,              // token_id
        transaction.hash,     // tx_hash
        CONTRACT_ADDRESS,     // contract_address
        'sepolia',            // chain（Sepoliaテストネット）
        userAddress           // minter_address
      )
      
      if (dbResult.success) {
        console.log('NFT情報をDBに保存しました')
      } else {
        console.error('NFT情報のDB保存に失敗:', dbResult.error)
        emitStatusMessage(`警告: NFT発行は成功しましたが、DB保存に失敗しました`, 'error')
      }
      
      mintingResult.value = {
        success: true,
        transactionHash: transaction.hash,
        tokenId: tokenId,
        message: 'NFTが正常に発行されました！'
      }
      emitStatusMessage('NFTの発行が完了しました', 'success')
      // 親コンポーネントにミント完了を通知
      emit('nftMinted', {
        success: true,
        transactionHash: transaction.hash,
        tokenId: tokenId
      })
    } catch (error) {
      console.error('NFT発行エラー:', error)
      mintingResult.value = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      emitStatusMessage('NFTの発行に失敗しました', 'error')
      // 親コンポーネントにミント失敗を通知
      emit('nftMinted', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      isMintingNFT.value = false
    }
  }

  // 再試行処理
  const retryMint = () => {
    mintingResult.value = null
    mintNFT()
  }

  // NFT発行要求の監視
  watch(() => props.mintRequested, (requested) => {
    if (requested && props.metadataUrl) {
      mintNFT()
    }
  })
</script>


<!-- Note
 
[ Web3Provider ]
  - アプリとチェーンを接続するためのインターフェイス
  - 具体的な機能
    - ブロックチェーンとの通信 - Ethereumネットワークとのやり取り
    - トランザクションの送信 - スマートコントラクトの関数呼び出し
    - アカウント管理 - ウォレットのアドレスや残高の取得
    - 署名機能 - トランザクションへの署名
  - 種類
    - MetaMaskなどのウォレットプロバイダー
      const provider = new ethers.providers.Web3Provider(window.ethereum)
    - JSON-RPCプロバイダー（直接ノードに接続）
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_KEY")
    - Infura/Alchemyなどの外部サービス
      const provider = new ethers.providers.InfuraProvider("sepolia", "YOUR_KEY")
  - プロバイダーの階層
    アプリケーション
        ↓
    Web3Provider (ethers.js)
        ↓
    MetaMask (window.ethereum)
        ↓
    Ethereumネットワーク

-->
