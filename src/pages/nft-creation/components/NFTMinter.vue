<template>
  <div class="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
    <h3 class="text-lg font-medium text-purple-800 mb-4">NFT発行</h3>
    <button
      @click="mintNFT"
      :disabled="isMintingNFT || !metadataUrl"
      class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isMintingNFT ? 'NFT発行中...' : 'メタデータでNFTを発行する' }}
    </button>
    <div v-if="mintingResult" class="mt-4 text-sm">
      <p v-if="mintingResult.success" class="text-green-600"><strong>NFT発行成功！</strong> トランザクションハッシュ: <a :href="`https://sepolia.etherscan.io/tx/${mintingResult.transactionHash}`" target="_blank" class="text-blue-600 hover:underline break-all">{{ mintingResult.transactionHash }}</a></p>
      <p v-else class="text-red-600"><strong>NFT発行失敗:</strong> {{ mintingResult.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { ethers } from 'ethers'
import { MyNFT_ABI } from '~/lib/MyNFT_ABI'

const props = defineProps({
  metadataUrl: {
    type: String,
    required: true
  }
})

// コントラクトアドレス (Sepoliaテストネットの仮のアドレス)
const CONTRACT_ADDRESS = "0x954d9D7B8b7715983bB4806cC3b071b9d1186Fd2" // TODO: ここを実際のコントラクトアドレスに置き換えてください

const isMintingNFT = ref(false)
const mintingResult = ref<any>(null)

const mintNFT = async () => {
  if (!props.metadataUrl) {
    alert('メタデータURLがありません。先にメタデータをアップロードしてください。')
    return
  }

  isMintingNFT.value = true
  mintingResult.value = null

  try {
    // MetaMaskなどのウォレットプロバイダに接続
    // @ts-ignore
    if (!window.ethereum) {
      alert('MetaMask (またはWeb3ウォレット) がインストールされていません。')
      isMintingNFT.value = false
      return
    }

    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []) // ウォレットに接続を要求
    const signer = provider.getSigner() // 署名者を取得

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT_ABI, signer)

    const userAddress = await signer.getAddress()
    const metadataUri = props.metadataUrl

    console.log(`NFTをミント中... To: ${userAddress}, URI: ${metadataUri}`)
    const transaction = await contract.mint(userAddress, metadataUri)
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
