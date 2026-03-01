# 環境構築手順書

## 前提条件

以下がインストール済みであること:

- Node.js (v20以上)
- Docker / Docker Compose
- Git

## 1. リポジトリのクローン

```bash
git clone <リポジトリURL>
cd lostItem
```

## 2. 依存関係のインストール

```bash
cd web
npm install
```

> **注意**: yarn / pnpm は使用禁止です。必ず npm を使ってください。

## 3. 環境変数の準備

```bash
# web/ ディレクトリ内で実行
cp .env.example .env

# リポジトリルートにシンボリックリンクを作成（docker composeがポート設定を読むため）
cd ..
ln -s web/.env .env
cd web
```

`web/.env` の内容（デフォルトのままでOK）:

```
# Docker Compose ポート設定（変更可能）
DB_PORT=5432
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

# アプリ設定（ポート番号を変えた場合はここも合わせる）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lostitem

S3_ENDPOINT=http://localhost:9000
S3_BUCKET=lostitem
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minio-admin-pass1
S3_REGION=ap-northeast-1
```

> **ポートが競合する場合**: `DB_PORT` や `MINIO_PORT` を変更してください。
> `DB_PORT` を変えたら `DATABASE_URL` のポート番号も合わせてください。

## 4. Docker Compose起動

**リポジトリルートで実行してください。**

PostgreSQL と MinIO（S3互換ストレージ）を起動します。

```bash
# リポジトリルートで実行
cd ..
docker compose up -d
```

起動確認:

```bash
docker compose ps
```

3つのコンテナが表示されればOKです（`minio-init` は実行完了後に終了します）:

| コンテナ   | 役割                             | ポート                      |
| ---------- | -------------------------------- | --------------------------- |
| db         | PostgreSQL                       | 5432                        |
| minio      | S3互換ストレージ                 | 9000（API）/ 9001（管理UI） |
| minio-init | バケット自動作成（起動後に終了） | -                           |

### MinIO管理画面

ブラウザで http://localhost:9001 を開くと MinIO の管理画面にアクセスできます。

- ユーザー名: `minioadmin`
- パスワード: `minio-admin-pass1`

ここでアップロードされた画像を確認できます。

## 5. DBマイグレーション

```bash
# web/ ディレクトリで実行
cd web
npm run db:migrate
```

マイグレーション名を聞かれたら適当な名前を入力してください（例: `init`）。

## 6. テスト用DBマイグレーション

```bash
npm run db:migrate:test
```

## 7. Prisma Clientの生成

マイグレーション時に自動で生成されますが、手動で実行する場合:

```bash
npx prisma generate
```

## 8. seedデータの投入（任意）

サンプルデータを投入する場合:

```bash
npm run db:seed
```

## 9. 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 にアクセスして画面が表示されればセットアップ完了です。

## テスト

Docker Compose内にテスト専用のPostgreSQLとMinIOが含まれています（`db-test`, `minio-test`）。
`docker compose up -d` で開発用と一緒に起動されます。

テスト実行:

```bash
# web/ ディレクトリで実行
npm run test

# watchモード（ファイル変更で自動再実行）
npm run test:watch
```

各テスト終了後にDBは自動でクリーンアップされるので、テスト間でデータが残る心配はありません。

テストファイルは `test/` ディレクトリに `app/` と同じ構造で配置します:

```
web/test/
├── cleanup.ts                # テスト後の自動クリーンアップ
└── services/
    └── s3.server.test.ts     # app/services/s3.server.ts のテスト
```

> **ポート番号**: テスト用DBは `5555`、テスト用MinIOは `9002` がデフォルトです。
> 変更する場合は `.env` の `TEST_DB_PORT` / `TEST_MINIO_PORT` と `vitest.config.ts` の `test.env` を合わせてください。

## よく使うコマンド

`npm` コマンドは `web/` ディレクトリで、`docker compose` コマンドはリポジトリルートで実行してください。

| コマンド                 | 実行場所 | 説明                                              |
| ------------------------ | -------- | ------------------------------------------------- |
| `npm run dev`            | web/     | 開発サーバー起動                                  |
| `npm run test`           | web/     | テスト実行                                        |
| `npm run test:watch`     | web/     | テスト実行（watchモード）                         |
| `npm run build`          | web/     | 本番ビルド                                        |
| `npm run db:migrate`     | web/     | マイグレーション実行                              |
| `npm run db:migrate:test`| web/     | テスト用DBマイグレーション                        |
| `npm run db:seed`        | web/     | seedデータ投入                                    |
| `npm run db:reset`       | web/     | DB初期化（全データ削除 → マイグレーション再実行） |
| `docker compose up -d`   | ルート   | Docker起動                                        |
| `docker compose down`    | ルート   | Docker停止                                        |
| `docker compose down -v` | ルート   | Docker停止 + データ削除                           |

## トラブルシューティング

### ポートが使われている

```bash
# 何がポートを使っているか確認
lsof -i :5432
```

`web/.env` のポート番号を変更して対処できます:

```bash
# 例: PostgreSQLを5434に変更
DB_PORT=5434
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/lostitem
```

変更後にリポジトリルートで `docker compose up -d` を再実行してください。

### DBに接続できない

```bash
# リポジトリルートで実行
docker compose logs db
```

### マイグレーションがエラーになる

```bash
# web/ ディレクトリで実行
npm run db:reset
```
