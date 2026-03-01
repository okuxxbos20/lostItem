# lostItem

落とし物検索システム

## 要件

- 落とし物（LostItem）の新規作成・一覧表示・詳細表示・削除ができる

### page

- 落とし物一覧画面
  - 将来的に検索とsortができるようにしたい
- 落とし物詳細画面
  - 画像uploadできる
  - 画像削除できる
  - ここで編集できる
  - ここで削除できる

## 技術スタック

- [React Router v7](https://reactrouter.com/) (旧Remix)
- Tailwind CSS v4
- Prisma 6
- PostgreSQL 16
- MinIO（ローカルS3互換ストレージ）
- Docker Compose

## セットアップ

詳しい手順は [docs/setup.md](docs/setup.md) を参照してください。

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の準備
cp .env.example .env

# 3. Docker Compose起動（PostgreSQL + MinIO）
docker compose up -d

# 4. DBマイグレーション
npm run db:migrate

# 5. 開発サーバー起動
npm run dev
```

## 制約条件

- AWSにdeployすることが目的
- S3にupload / downloadをしたい
- パッケージマネージャ: npm（yarn/pnpmは使用禁止）

## 当日TODO（13:00〜17:30）

### 1. 導入・環境構築（13:00〜13:30）30min

- [ ] 本日のゴールと全体像の説明
  - 完成イメージのデモを見せる
  - React Router v7 / Tailwind / AWS の役割を簡単に説明
- [x] 開発環境の確認
  - Node.js / npm が入っているか確認
  - Docker / Docker Composeが入っているか確認
  - AWS CLIが入っているか確認
  - kiro（エディタ）の起動確認
- [ ] プロジェクトのセットアップ
  - `npm install` で依存関係インストール
  - `cp .env.example .env` で環境変数準備
  - `docker compose up -d` でDB・MinIO起動
  - `npm run db:migrate` でマイグレーション実行
  - `npm run dev` で起動確認

### 2. 落とし物の一覧表示・新規作成（13:30〜14:30）60min

- [ ] データモデルの確認
  - LostItemの型定義（id, name, description, imageUrl, createdAt, updatedAt）
  - Prismaスキーマの確認
  - seedデータの投入（`npm run db:seed`）
- [ ] 一覧画面の作成（`/`）
  - loaderでデータ取得 → 一覧表示
  - Tailwindでカードレイアウトを適用
- [ ] 新規作成フォームの作成（`/new`）
  - actionでフォーム送信処理
  - 作成後に一覧画面へリダイレクト

### 休憩（14:30〜14:40）10min

### 3. 詳細表示・編集・削除（14:40〜15:40）60min

- [ ] 詳細画面の作成（`/$id`）
  - loaderでIDに対応するデータを取得・表示
- [ ] 編集機能の追加（`/$id/edit`）
  - 編集フォーム → actionで更新処理
  - 更新後に詳細画面へリダイレクト
- [ ] 削除機能の追加
  - 詳細画面に削除ボタンを配置
  - actionで削除処理 → 一覧へリダイレクト

### 休憩（15:40〜15:50）10min

### 4. S3画像アップロード（15:50〜16:30）40min

- [ ] 画像アップロード機能の実装
  - 詳細画面にファイル選択フォームを追加
  - conformとzodを使うことを指定
  - actionでS3にアップロード → URLを保存
  - ローカルではMinIOのS3エンドポイントに接続
- [ ] 画像表示・削除機能の実装
  - S3のURLから画像を表示
  - 削除ボタンでS3からも削除されていることを確認する
- [ ] 環境変数で接続先を切り替える設計
  - ローカル: MinIO（`http://localhost:9000`）
  - 本番: AWS S3

### 5. AWSへのデプロイ（16:30〜17:10）40min

- [ ] Dockerfileの作成
  - 本番用のマルチステージビルド
  - `npm run build` → `npm start` で起動
- [ ] ECRへのpush
  - ECRリポジトリ作成（AWSコンソール or CLI）
  - `docker build` → `docker tag` → `docker push`
- [ ] App Runnerでサービス作成
  - ECRのイメージをソースに指定
  - 環境変数の設定（DATABASE_URL, S3エンドポイント等）
  - ポート設定
- [ ] 動作確認
  - App RunnerのデフォルトURLにアクセス
  - 一覧・作成・詳細・編集・削除が動くか確認
  - S3画像アップロード/表示が動くか確認

### 6. まとめ・振り返り（17:10〜17:30）20min

- [ ] 今日やったことの振り返り
- [ ] 次のステップの紹介
  - 検索・ソート機能
  - 認証（Cognito）
- [ ] 質疑応答

---

### 事前準備（講師側）

- [ ] 完成版のデモアプリを用意しておく
- [ ] `docker-compose.yml` の動作確認
  - MinIO（S3互換）
  - PostgreSQL
  - MinIO初期化（バケット自動作成）
- [ ] S3バケット・IAMロールを事前に作成 or 手順書を準備（本番用）
- [ ] デプロイ先の環境を事前検証しておく
- [ ] 各ステップのサンプルコード（つまずいた人用）を用意
- [ ] Wi-Fi・Docker image事前pull・AWSアカウントのアクセス確認
