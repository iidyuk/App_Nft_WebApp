<template>
  <div class="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
    <h3 class="text-lg font-medium text-purple-800 mb-4">NFT発行</h3>
    
    <!-- コントラクトアドレスが設定されていない場合の警告 -->
    <div v-if="!CONTRACT_ADDRESS" class="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
      <p class="text-red-700 text-sm">NFTコントラクトアドレスが設定されていません</p>
    </div>
    
    <button
      @click="mintNFT"
      :disabled="isMintingNFT || !metadataUrl || !CONTRACT_ADDRESS"
      class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isMintingNFT ? 'NFT発行中...' : 'NFTを発行する' }}
    </button>
    <div v-if="mintingResult" class="mt-4 text-sm">
      <p
        v-if="mintingResult.success"
        class="text-green-600"
      >
        <strong>NFTを発行しました</strong> トランザクションハッシュ:
        <a
          :href="`https://sepolia.etherscan.io/tx/${mintingResult.transactionHash}`"
          target="_blank" class="text-blue-600 hover:underline break-all">{{ mintingResult.transactionHash }}
        </a>
      </p>
      <p v-else class="text-red-600"><strong>NFTの発行に失敗しました</strong> {{ mintingResult.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineProps } from 'vue'
  import { ethers } from 'ethers'
  import { MyNFT_ABI } from '~/lib/contracts/MyNFT_ABI'  // コントラクトのインターフェース定義

  const props = defineProps({
    metadataUrl: {
      type: String,
      required: true
    }
  })

  const isMintingNFT = ref(false)
  const mintingResult = ref<any>(null)

  // 環境変数からコントラクトアドレスを取得
  const config = useRuntimeConfig()
  const CONTRACT_ADDRESS = config.public.nftContractAddress

  const mintNFT = async () => {

    // メタデータURLのチェック
    if (!props.metadataUrl) {
      alert('メタデータURLがありません。先にメタデータをアップロードしてください。')
      return
    }

    // コントラクトアドレスのチェック
    if (!CONTRACT_ADDRESS) {
      alert('NFTコントラクトアドレスが設定されていません')
      return
    }

    isMintingNFT.value = true  // NFT発行処理の状態
    mintingResult.value = null  // NFT発行結果の情報

    try {
      // MetaMaskなどのウォレットプロバイダに接続
      // @ts-ignore
      if (!window.ethereum) {
        alert('MetaMask (またはWeb3ウォレット) がインストールされていません。')
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
      await transaction.wait() // トランザクションが承認されるのを待つ
      console.log('トランザクション承認済み:', transaction.hash)
      mintingResult.value = {
        success: true,
        transactionHash: transaction.hash,
        message: 'NFTが正常に発行されました！'
      }
    } catch (error) {
      console.error('NFT発行エラー:', error)
      mintingResult.value = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      isMintingNFT.value = false
    }
  }
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
