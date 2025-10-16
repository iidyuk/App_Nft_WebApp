# メンテナンススクリプト

## cleanup-orphan-metadata.js

DBに存在するが、Pinataに存在しないメタデータレコードを検出して削除するスクリプト。

### 前提条件

以下の環境変数が必要です：

- `SUPABASE_URL` または `NUXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PINATA_JWT_KEY`

### 使用方法

#### 1. ドライラン（実際の削除は行わない）

```bash
# 削除対象を確認のみ
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx PINATA_JWT_KEY=xxx npm run cleanup:metadata:dry
```

または

```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx PINATA_JWT_KEY=xxx node scripts/cleanup-orphan-metadata.js --dry-run
```

#### 2. 実際に削除

```bash
# 孤立レコードを削除
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx PINATA_JWT_KEY=xxx npm run cleanup:metadata
```

または

```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx PINATA_JWT_KEY=xxx node scripts/cleanup-orphan-metadata.js
```

### 動作

1. DBから`metadata`テーブルのすべてのレコードを取得
2. 各レコードの`pinata_cid`がPinataに存在するか確認
3. 存在しない場合：
   - `--dry-run`モード：削除対象としてリスト表示のみ
   - 通常モード：DBから削除

### 出力例

```
🔍 孤立メタデータのクリーンアップを開始します...

📋 DRY RUN モード: 実際の削除は行いません

📊 DBからメタデータを取得中...
📦 5 件のメタデータを確認します

[1/5] CIDをチェック中: QmXxx...
  ✅ 正常
[2/5] CIDをチェック中: QmYyy...
  ❌ Pinataに存在しません
  🔍 [DRY RUN] 削除対象としてマークされました
...

============================================================
📊 クリーンアップ結果
============================================================
チェック件数: 5
孤立レコード: 1
削除対象: 1 件

💡 実際に削除するには、--dry-run オプションを外して実行してください

孤立レコード一覧:
  1. CID: QmYyy... (作成日時: 2025-10-15T12:00:00.000Z)

✅ クリーンアップが完了しました
```

### 注意事項

- **必ず最初に`--dry-run`で確認**してから実行してください
- Pinata APIのレート制限を考慮し、各リクエスト間に100msの待機時間を設定しています
- `SUPABASE_SERVICE_ROLE_KEY`は管理者権限なので、取り扱いに注意してください

### トラブルシューティング

#### 環境変数エラー

```
❌ 環境変数 SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です
```

→ 環境変数を設定してください

#### Pinata接続エラー

```
⚠️  CIDチェックエラー (QmXxx...): ...
```

→ `PINATA_JWT_KEY`が正しいか確認してください

#### 削除エラー

```
❌ 削除エラー (QmXxx...): ...
```

→ データベース接続またはRLS設定を確認してください

