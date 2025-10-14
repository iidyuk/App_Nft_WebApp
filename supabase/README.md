# Supabase Database Management

## 環境設定

### 1. 環境変数ファイルの設定
`.env`ファイルに以下の内容を追記してください：

```bash
# Supabase CLI Configuration
SUPABASE_CONFIG_PATH=supabase/config.toml
SUPABASE_MIGRATIONS_PATH=supabase/migrations
```

### 2. 環境変数の読み込み
Supabaseコマンドを実行する前に、ターミナルで環境変数を読み込んでください：

```bash
# 環境変数を読み込み
source .env

# 環境変数が正しく設定されたか確認
echo $SUPABASE_CONFIG_PATH
# 出力: supabase/config.toml
```

### 3. Supabaseコマンドの実行
環境変数を読み込んだ後、npxを使用してSupabaseコマンドが使用できます：

```bash
# ローカル開発環境の起動
npx supabase start

# データベースのマイグレーション実行
npx supabase db push

# 新しいマイグレーションの作成
npx supabase migration new create_nft_tables

# ローカル開発環境の停止
npx supabase stop
```

## 注意事項

- 環境変数は**そのターミナルセッション中のみ有効**です
- 新しいターミナルを開いた場合は、再度`source .env`を実行してください
- Supabaseコマンドを実行する前に、必ず環境変数を読み込んでください

## トラブルシューティング

### 環境変数が読み込まれない場合
```bash
# ファイルの存在確認
ls -la .env

# ファイルの内容確認
cat .env

# 手動で環境変数を設定
export SUPABASE_CONFIG_PATH=supabase/config.toml
```

### Supabaseコマンドが見つからない場合
```bash
# Supabase CLIのインストール確認
npx supabase --version

# ローカルインストール（推奨）
npm install --save-dev supabase

# または、プロジェクトルートでnpxを使用
npx supabase --help
```

### Supabaseコマンドの実行方法
```bash
# npxを使用してSupabaseコマンドを実行
npx supabase start
npx supabase db push
npx supabase migration new create_nft_tables
npx supabase stop
```

## リモートSupabaseプロジェクトへのマイグレーションアップロード

### 前提条件
- Supabaseアカウントが必要
- リモートSupabaseプロジェクトが作成済みであること

### 手順

#### 1. Supabaseにログイン
```bash
npx supabase login
```
- ブラウザが開いて認証画面が表示されます
- 初回のみ実行すればOK

#### 2. プロジェクトをリンク
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```
- `YOUR_PROJECT_ID`は実際のプロジェクトIDに置き換えてください
- プロジェクトIDはSupabaseダッシュボードのURLから確認できます
- 例: `https://supabase.com/dashboard/project/abcdefghijklmnop` → プロジェクトID: `abcdefghijklmnop`

#### 3. マイグレーションをプッシュ
```bash
# 環境変数を読み込み
source .env

# マイグレーションをリモートにプッシュ
npx supabase db push
```

### プロジェクトIDの確認方法
1. [Supabase Dashboard](https://supabase.com/dashboard)にアクセス
2. 対象のプロジェクトを選択
3. URLからプロジェクトIDを確認
   - URL例: `https://supabase.com/dashboard/project/abcdefghijklmnop`
   - プロジェクトID: `abcdefghijklmnop`

### ローカル開発のみの場合
リモートプロジェクトへの接続が不要で、ローカル開発のみを行う場合：
```bash
# ローカル環境のみでマイグレーションをテスト
npx supabase start
npx supabase db push
npx supabase stop
```