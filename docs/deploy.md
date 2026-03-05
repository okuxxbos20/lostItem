# AWSデプロイ手順書

## 前提条件

- AWS CLIがインストール済み, `aws configure` で認証設定済み
- Terraformがインストール済み（>= 1.0）
- Dockerがインストール済み

## 全体の流れ

```txt
1. Terraformバックエンド(S3 + DynamoDB)の手動作成
2. terraform.tfvars の設定
3. terraform init / plan / apply でAWSリソース作成
4. Dockerイメージをビルド & ECRにpush
5. DBマイグレーション実行
6. App Runnerでデプロイ確認
```

---

## 1. Terraformバックエンドの準備（初回のみ）

Terraformの状態管理用にS3バケットとDynamoDBテーブルを手動で作成する.

```bash
# S3バケット（tfstate保存用）
aws s3api create-bucket \
  --bucket lostitem-tfstate-xxx \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws s3api put-bucket-versioning \
  --bucket lostitem-tfstate-xxx \
  --versioning-configuration Status=Enabled

# DynamoDB テーブル（state lock用）
aws dynamodb create-table \
  --table-name lostitem-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

> `lostitem-tfstate-xxx` の `xxx` は一意な値に変更すること.
> `infra/env/prod/backend.tf` のバケット名も合わせて変更する.

---

## 2. terraform.tfvars の設定

```bash
cd infra/env/prod
cp terraform.tfvars terraform.tfvars  # 既にある場合はそのまま編集
```

`infra/env/prod/terraform.tfvars` を編集:

```hcl
project_name = "lostItem"
aws_region   = "ap-northeast-1"
db_name      = "lostitem"
db_username  = "postgres"
db_password  = "＜強固なパスワードに変更＞"
s3_bucket    = "lostitem-images-xxx"  # 一意な名前に変更
```

---

## 3. Terraformでインフラ構築

```bash
cd infra/env/prod

# 初期化
terraform init

# 実行計画の確認
terraform plan

# リソース作成
terraform apply
```

作成されるリソース:
| リソース | 用途 |
|---|---|
| ECR | Dockerイメージのレジストリ |
| App Runner | アプリケーション実行環境 |
| RDS (PostgreSQL 16) | データベース |
| S3 | 画像ストレージ |
| IAM Role | App Runner → ECR/S3 のアクセス権限 |
| VPC Connector | App Runner → RDS の接続 |

apply完了後, outputsを確認:

```bash
terraform output
```

以下の値が出力される:

- `ecr_repository_url` — ECRリポジトリURL
- `app_runner_service_url` — アプリのURL
- `rds_endpoint` — RDSエンドポイント
- `s3_bucket_name` — S3バケット名

---

## 4. DockerイメージをビルドしてECRにpush

```bash
# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ecr_repository_url>

# ビルド（リポジトリルートで実行）
cd /path/to/lostItem
docker build -t lostitem ./web

# タグ付け
docker tag lostitem:latest <ecr_repository_url>:latest

# push
docker push <ecr_repository_url>:latest
```

> `<ecr_repository_url>` は `terraform output ecr_repository_url` で取得した値に置き換える.

---

## 5. DBマイグレーション

RDSはVPC内にあるため, 直接接続できない.
以下のいずれかの方法でマイグレーションを実行する.

### 方法A: App Runnerのデプロイ後に実行（推奨）

App Runnerが起動した後, アプリ内でPrismaが自動的にスキーマを確認する.
事前にDockerfileにマイグレーションコマンドを追加する方法:

```dockerfile
# Dockerfile の CMD を変更
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
```

### 方法B: EC2踏み台 or SSMセッション経由

```bash
# 踏み台サーバーから実行
DATABASE_URL=postgresql://postgres:<password>@<rds_endpoint>/lostitem \
  npx prisma migrate deploy
```

---

## 6. App Runnerのデプロイ

ECRにイメージをpushした後, App Runnerのデプロイをトリガーする.

```bash
# サービスARNを取得
SERVICE_ARN=$(cd infra/env/prod && terraform output -raw app_runner_service_arn)

# デプロイ開始
aws apprunner start-deployment --service-arn "$SERVICE_ARN"
```

---

## 7. 動作確認

```bash
# App Runner URLを取得
APP_URL=$(cd infra/env/prod && terraform output -raw app_runner_service_url)

echo "https://$APP_URL"
```

ブラウザでアクセスし, 以下を確認:

- [ ] 一覧画面が表示される
- [ ] 落とし物を新規作成できる
- [ ] 詳細画面で編集・削除できる
- [ ] 画像のアップロード・表示・削除ができる

---

## 環境変数一覧（App Runner）

Terraformで自動設定される環境変数:

| 変数名         | 値                    | 説明          |
| -------------- | --------------------- | ------------- |
| `DATABASE_URL` | `postgresql://...`    | RDS接続文字列 |
| `S3_BUCKET`    | `lostitem-images-xxx` | S3バケット名  |
| `S3_REGION`    | `ap-northeast-1`      | S3リージョン  |

> ローカルで使用していた `S3_ENDPOINT` は本番では不要（AWS SDKがデフォルトでAWS S3に接続する）.
> ローカルで使用していた `S3_ACCESS_KEY` / `S3_SECRET_KEY` も不要（IAMロールで認証される）.

---

## リソースの削除

```bash
cd infra/env/prod
terraform destroy
```

> RDSは `skip_final_snapshot = true` に設定されているため, スナップショットなしで即削除される.

バックエンド（S3 + DynamoDB）は手動で削除する:

```bash
aws s3 rb s3://lostitem-tfstate-xxx --force
aws dynamodb delete-table --table-name lostitem-tflock --region ap-northeast-1
```
