/**
 * 孤立メタデータのクリーンアップスクリプト
 * 
 * DBに存在するが、Pinataに存在しないメタデータレコードを検出して削除する
 * 
 * 使用方法:
 * node scripts/cleanup-orphan-metadata.js [--dry-run]
 * 
 * 環境変数は .env ファイルから自動読み込みされます
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// .envファイルを手動で読み込む
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env')

try {
  const envFile = readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').replace(/^["']|["']$/g, '')
      if (key && value) {
        process.env[key] = value
      }
    }
  })
  console.log('✅ .envファイルを読み込みました\n')
} catch (error) {
  console.log('⚠️  .envファイルが見つかりません。環境変数を直接指定してください。\n')
}

// 環境変数から取得
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PINATA_JWT_KEY = process.env.PINATA_JWT_KEY

// コマンドライン引数
const isDryRun = process.argv.includes('--dry-run')

if (!SUPABASE_URL) {
  console.error('❌ 環境変数 NUXT_PUBLIC_SUPABASE_URL または SUPABASE_URL が必要です')
  process.exit(1)
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数 SUPABASE_SERVICE_ROLE_KEY が必要です')
  console.error('   Supabaseダッシュボード → Settings → API → service_role の secret をコピーして .env に追加してください')
  process.exit(1)
}

if (!PINATA_JWT_KEY) {
  console.error('❌ 環境変数 PINATA_JWT_KEY が必要です')
  console.error('   Pinataダッシュボード → API Keys から JWT をコピーして .env に追加してください')
  process.exit(1)
}

// Supabaseクライアント（管理者権限）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * PinataでCIDが自分のアカウントにpinされているか確認
 */
async function checkPinataCID(cid) {
  try {
    // Pinata APIで自分がpinしているか確認
    const response = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&hashContains=${cid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT_KEY}`
      }
    })
    
    if (!response.ok) {
      console.error(`  ⚠️  Pinata APIエラー (${cid}): ${response.status}`)
      return false
    }
    
    const data = await response.json()
    // rowsに該当CIDが含まれていればpinされている
    return data.count > 0
  } catch (error) {
    console.error(`  ⚠️  CIDチェックエラー (${cid}):`, error.message)
    return false
  }
}

/**
 * メタデータレコードを削除
 */
async function deleteMetadata(id, cid) {
  try {
    const { error } = await supabase
      .from('metadata')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    return true
  } catch (error) {
    console.error(`  ❌ 削除エラー (${cid}):`, error.message)
    return false
  }
}

/**
 * メイン処理
 */
async function cleanupOrphanMetadata() {
  console.log('🔍 孤立メタデータのクリーンアップを開始します...\n')
  
  if (isDryRun) {
    console.log('📋 DRY RUN モード: 実際の削除は行いません\n')
  }

  try {
    // DBからすべてのメタデータを取得
    console.log('📊 DBからメタデータを取得中...')
    const { data: metadataList, error: fetchError } = await supabase
      .from('metadata')
      .select('id, pinata_cid, created_at')
    
    if (fetchError) {
      throw new Error(`メタデータ取得エラー: ${fetchError.message}`)
    }

    if (!metadataList || metadataList.length === 0) {
      console.log('✅ メタデータレコードが見つかりませんでした')
      return
    }

    console.log(`📦 ${metadataList.length} 件のメタデータを確認します\n`)

    let checkedCount = 0
    let orphanCount = 0
    let deletedCount = 0
    const orphanRecords = []

    // 各メタデータレコードをチェック
    for (const metadata of metadataList) {
      checkedCount++
      console.log(`[${checkedCount}/${metadataList.length}] CIDをチェック中: ${metadata.pinata_cid}`)
      
      const exists = await checkPinataCID(metadata.pinata_cid)
      
      if (!exists) {
        orphanCount++
        console.log(`  ❌ Pinataに存在しません`)
        orphanRecords.push(metadata)
        
        if (!isDryRun) {
          const deleted = await deleteMetadata(metadata.id, metadata.pinata_cid)
          if (deleted) {
            deletedCount++
            console.log(`  🗑️  DBから削除しました`)
          }
        } else {
          console.log(`  🔍 [DRY RUN] 削除対象としてマークされました`)
        }
      } else {
        console.log(`  ✅ 正常`)
      }
      
      // レート制限対策: 少し待機
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 結果サマリー
    console.log('\n' + '='.repeat(60))
    console.log('📊 クリーンアップ結果')
    console.log('='.repeat(60))
    console.log(`チェック件数: ${checkedCount}`)
    console.log(`孤立レコード: ${orphanCount}`)
    
    if (isDryRun) {
      console.log(`削除対象: ${orphanCount} 件`)
      console.log('\n💡 実際に削除するには、--dry-run オプションを外して実行してください')
    } else {
      console.log(`削除成功: ${deletedCount}`)
      console.log(`削除失敗: ${orphanCount - deletedCount}`)
    }

    if (orphanRecords.length > 0) {
      console.log('\n孤立レコード一覧:')
      orphanRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. CID: ${record.pinata_cid} (作成日時: ${record.created_at})`)
      })
    }

    console.log('\n✅ クリーンアップが完了しました')

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message)
    process.exit(1)
  }
}

// 実行
cleanupOrphanMetadata()

