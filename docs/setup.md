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
npm install
```

> **注意**: yarn / pnpm は使用禁止です。必ず npm を使ってください。

## 3. 環境変数の準備

```bash
cp .env.example .env
```

`.env` の内容（デフォルトのままでOK）:

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
S3_SECRET_KEY=minioadmin
S3_REGION=ap-northeast-1
```

> **ポートが競合する場合**: `DB_PORT` や `MINIO_PORT` を変更してください。
> `DB_PORT` を変えたら `DATABASE_URL` のポート番号も合わせてください。

## 4. Docker Compose起動

PostgreSQL と MinIO（S3互換ストレージ）を起動します。

```bash
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
npm run db:migrate
```

マイグレーション名を聞かれたら適当な名前を入力してください（例: `init`）。

## 6. Prisma Clientの生成

マイグレーション時に自動で生成されますが、手動で実行する場合:

```bash
npx prisma generate
```

## 7. seedデータの投入（任意）

サンプルデータを投入する場合:

```bash
npm run db:seed
```

## 8. 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 にアクセスして画面が表示されればセットアップ完了です。

## テスト

Docker Compose内にテスト専用のPostgreSQLとMinIOが含まれています（`db-test`, `minio-test`）。
`docker compose up -d` で開発用と一緒に起動されます。

環境構築時にテスト用DBへのマイグレーションも実行しておいてください:

```bash
# テスト用DBにマイグレーション適用
npm run db:migrate:test
```

テスト実行:

```bash
# テスト実行
npm run test

# watchモード（ファイル変更で自動再実行）
npm run test:watch
```

各テスト終了後にDBは自動でクリーンアップされるので、テスト間でデータが残る心配はありません。

テストファイルは `test/` ディレクトリに `app/` と同じ構造で配置します:

```
test/
├── setup.ts              # テスト共通ユーティリティ
└── services/
    └── s3.server.test.ts  # app/services/s3.server.ts のテスト
```

> **ポート番号**: テスト用DBは `5555`、テスト用MinIOは `9002` がデフォルトです。
> 変更する場合は `.env` の `TEST_DB_PORT` / `TEST_MINIO_PORT` と `vitest.config.ts` の `test.env` を合わせてください。

## よく使うコマンド

| コマンド                 | 説明                                              |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | 開発サーバー起動                                  |
| `npm run test`           | テスト実行                                        |
| `npm run test:watch`     | テスト実行（watchモード）                         |
| `npm run build`          | 本番ビルド                                        |
| `npm run db:migrate`     | マイグレーション実行                              |
| `npm run db:seed`        | seedデータ投入                                    |
| `npm run db:reset`       | DB初期化（全データ削除 → マイグレーション再実行） |
| `docker compose up -d`   | Docker起動                                        |
| `docker compose down`    | Docker停止                                        |
| `docker compose down -v` | Docker停止 + データ削除                           |

## トラブルシューティング

### ポートが使われている

```bash
# 何がポートを使っているか確認
lsof -i :5432
```

`.env` のポート番号を変更して対処できます:

```bash
# 例: PostgreSQLを5434に変更
DB_PORT=5434
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/lostitem
```

変更後に `docker compose up -d` で再起動してください。

### DBに接続できない

```bash
# Docker Composeのログを確認
docker compose logs db
```

### マイグレーションがエラーになる

```bash
# DBをリセットして最初からやり直す
npm run db:reset
```
