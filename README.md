# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Pinata設定

### 1. Pinata APIキーの取得

1. [Pinata](https://app.pinata.cloud/) にアクセス
2. アカウントを作成またはログイン
3. API KeysセクションでJWT Keyを取得

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Pinata JWT Key
PINATA_JWT_KEY=your_pinata_jwt_key_here

# Supabase設定（既存）
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```


## Supabase設定

### 1. Supabase Storageバケットの作成

Supabaseダッシュボードで以下の手順を実行してください：

1. **Storage**セクションに移動
2. **New bucket**をクリック
3. バケット名を`images`として作成
4. **Public bucket**として設定（画像を公開アクセス可能にするため）

### 2. Storageポリシーの設定

`images`バケットに対してポリシーを設定してください：


## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
