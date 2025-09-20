// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',

  // 環境変数の設定
  runtimeConfig: {
    // クライアントサイドでも利用可能な環境変数
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      nftStorageApiKey: process.env.NFT_STORAGE_API_KEY,
      pinataJWTKey: process.env.PINATA_JWT_KEY
    }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/fonts'
  ],

  // Tailwind CSS設定（@nuxt/uiが自動的にTailwindを含む）
  css: ['~/assets/css/main.css']
})
