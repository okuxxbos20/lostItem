# AWS 事前準備TODO

落とし物検索アプリのデプロイに必要なAWSリソースの準備.

## 1. IAM

- [ ] ハンズオン用IAMユーザーの作成（受講者分）
  - プログラムによるアクセス（アクセスキー）を有効化
  - 必要なポリシーをアタッチ
- [ ] IAMポリシーの作成
  - S3: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`
  - ECR: `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`
  - App Runner: `apprunner:CreateService`, `apprunner:UpdateService`, `apprunner:DescribeService`
- [ ] App Runner用のアクセスロール作成
  - ECRからイメージをpullするための`AppRunnerECRAccessRole`
  - アプリからS3にアクセスするためのインスタンスロール

## 2. ECR

- [ ] リポジトリ作成
  - リポジトリ名: `lost-and-found`
  - イメージスキャン: 有効化（推奨）
  - タグのイミュータビリティ: 無効（上書き可にしておくと当日楽）

## 3. S3

- [ ] バケット作成
  - バケット名: 一意な名前を決めておく（例: `lost-and-found-images-{suffix}`）
  - リージョン: App Runnerと同じリージョン
  - パブリックアクセス: ブロック（署名付きURL or App Runner経由でアクセス）
- [ ] CORSの設定（必要に応じて）
- [ ] バケットポリシーの設定
  - App Runnerのインスタンスロールからのアクセスを許可

## 4. RDS（PostgreSQL）

- [ ] DBインスタンス作成
  - エンジン: PostgreSQL
  - インスタンスクラス: `db.t3.micro`（無料枠）
  - ストレージ: 20GB gp2
  - マルチAZ: 無効（ハンズオン用なので不要）
- [ ] ネットワーク設定
  - VPC: デフォルトVPC or 専用VPC
  - サブネットグループの作成
  - セキュリティグループ: App Runnerからの5432ポートを許可
- [ ] DB初期設定
  - データベース名: `lost_and_found`
  - マスターユーザー名 / パスワードの設定
- [ ] 接続確認
  - DB clientで接続テスト

## 5. App Runner

- [ ] VPCコネクタの作成（RDSへの接続用）
  - RDSと同じVPC / サブネットを指定
  - セキュリティグループの設定
- [ ] サービス設定の確認事項
  - ソース: ECRイメージ
  - ポート: 3000（Remixデフォルト）
  - 環境変数:
    - `DATABASE_URL`: RDSの接続文字列
    - `AWS_S3_BUCKET`: S3バケット名
    - `AWS_REGION`: リージョン
  - インスタンスロール: S3アクセス用ロールを指定
  - VPCコネクタ: 上記で作成したものを指定

## 6. ネットワーク構成

```txt
[ユーザー] → [App Runner] → [RDS (PostgreSQL)]
                  ↓
               [S3 (画像)]
```

- App RunnerはVPCコネクタ経由でRDSに接続
- App RunnerからS3へはインスタンスロールで認証

## 7. コスト見積もり（ハンズオン期間中）

- [ ] 見積もりを確認しておく
  - RDS db.t3.micro: 無料枠対象（12ヶ月以内の場合）
  - App Runner: 使用時間に応じた課金
  - S3: ほぼ無料（少量のため）
  - ECR: 500MB/月まで無料
- [ ] ハンズオン終了後の削除手順を用意
  - App Runnerサービスの削除
  - RDSインスタンスの削除（スナップショット不要）
  - ECRリポジトリの削除
  - S3バケットの中身を空にして削除
