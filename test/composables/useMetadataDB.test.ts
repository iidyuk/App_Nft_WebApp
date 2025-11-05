import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMetadataDB } from '~/lib/composables/useMetadataDB'

// Supabaseクライアントのモック
vi.mock('~/lib/external/supabase', () => ({
  supabaseConfig: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-image-id' },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-metadata-id',
              image_id: 'test-image-id',
              pinata_cid: 'test-cid',
              pinata_url: 'https://test.pinata.cloud/ipfs/test-cid',
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

describe('useMetadataDB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getImageIdByPath', () => {
    it('画像パスからIDを取得できる', async () => {
      const { getImageIdByPath } = useMetadataDB()
      const result = await getImageIdByPath('test-image.jpg')

      expect(result.success).toBe(true)
      expect(result.imageId).toBe('test-image-id')
    })
  })

  describe('saveMetadata', () => {
    it('メタデータを保存できる', async () => {
      const { saveMetadata } = useMetadataDB()
      const result = await saveMetadata(
        'test-image-id',
        'test-cid',
        'https://test.pinata.cloud/ipfs/test-cid'
      )

      expect(result.success).toBe(true)
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.pinata_cid).toBe('test-cid')
    })
  })
})