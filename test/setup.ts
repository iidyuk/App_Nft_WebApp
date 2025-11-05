import { vi } from 'vitest'

// Nuxt composablesのモック
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    pinataJWTKey: 'test-pinata-jwt',
    nftContractAddress: '0xTestContractAddress',
  },
}))

global.useRoute = vi.fn(() => ({
  query: {},
  params: {},
}))

global.navigateTo = vi.fn()