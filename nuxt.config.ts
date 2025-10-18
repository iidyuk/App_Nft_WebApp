// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',

  nitro: {
    preset: 'netlify'
  },

  // ディレクトリの設定
  dir: {
    middleware: 'lib/middleware',
    layouts: 'layout',
    assets: 'lib/assets'
  },

  // composablesディレクトリの設定
  imports: {
    dirs: [
      // 'composables',
      'lib/composables'
    ]
  },

  // 環境変数の設定
  runtimeConfig: {
    // クライアントサイドでも利用可能な環境変数
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      pinataJWTKey: process.env.PINATA_JWT_KEY,
      nftContractAddress: process.env.NUXT_PUBLIC_NFT_CONTRACT_ADDRESS
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/fonts'
  ],

  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width',
      title: 'nft dapp',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      htmlAttrs: {
        lang: 'ja',
        prefix: 'og: https://ogp.me/ns#'
      },
    }
  },
})
