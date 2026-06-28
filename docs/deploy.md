# AWSデプロイ手順書

## 前提条件

- AWS CLIがインストール済み
- Terraformがインストール済み（>= 1.0）
- Dockerがインストール済み

## 全体の流れ

```txt
0. AWS CLIの設定
1. デフォルトVPCの作成 & Terraformバックエンド(S3)の手動作成
2. terraform.tfvars の設定
3. terraform init / plan / apply でAWSリソース作成
4. Dockerイメージをビルド & ECRにpush
5. DBマイグレーション実行
6. App Runnerでデプロイ確認
```

---

## 0. AWS CLIの設定（初回のみ）

AWS IAM Identity Center (SSO) 経由でCLIを設定する.

```bash
aws configure sso --profile <PROFILE_NAME>
```

| 項目                    | 値                                       |
| ----------------------- | ---------------------------------------- |
| SSO session name        | `lostitem`                               |
| SSO start URL           | `https://d-9567b4510c.awsapps.com/start` |
| SSO Region              | `ap-northeast-1`                         |
| SSO registration scopes | デフォルト（そのままEnter）              |

ブラウザが開くので認証を承認し, アカウントとロール（`AWSAdministratorAccess`）を選択する.

確認:

```bash
aws sts get-caller-identity --profile <PROFILE_NAME>
```

以降のコマンドは `--profile <PROFILE_NAME>` を付けるか, 環境変数で切り替える:

```bash
export AWS_PROFILE=<PROFILE_NAME>
```

> SSOセッションは一定時間で期限切れになる. 期限切れ時は `aws sso login --profile <PROFILE_NAME>` で再認証する.

---

## 1. デフォルトVPCの作成 & Terraformバックエンドの準備（初回のみ）

### デフォルトVPCの作成

App RunnerのVPC ConnectorやRDSはVPC内に配置される. デフォルトVPCが存在しない場合は作成する.

```bash
aws ec2 create-default-vpc --profile <PROFILE_NAME>
```

> 既にデフォルトVPCがある場合は `An error occurred (DefaultVpcAlreadyExists)` と表示されるが問題ない.

> **補足: 専用VPCへの移行について**
> 本番運用では専用VPCをTerraformで作成するのがベストプラクティス.
> 現在はデフォルトVPCを使用しているが, 将来的にはCIDR設計・サブネット分割（パブリック/プライベート）・
> NATゲートウェイの配置を含む専用VPCモジュールを `infra/modules/vpc/` に作成し,
> 各モジュールの `data "aws_vpc" "default"` を専用VPCの参照に置き換えることを推奨する.

### Terraformバックエンド（S3）の作成

Terraformの状態管理用にS3バケットを手動で作成する.

```bash
# S3バケット（tfstate保存用）
aws s3api create-bucket \
  --bucket lostitem-tfstate-xxx \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws s3api put-bucket-versioning \
  --bucket lostitem-tfstate-xxx \
  --versioning-configuration Status=Enabled
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
s3_bucket    = "lostitem-images-xxx"  # 一意な名前に変更
```

> `db_password` はセキュリティのため環境変数で渡す（tfvarsには書かない）.

---

## 3. Terraformでインフラ構築

```bash
cd infra/env/prod

# DBパスワードを環境変数で設定
export TF_VAR_db_password="＜強固なパスワード＞"

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

マイグレーション専用の `Dockerfile.migrate` を使い, ECSタスクとして実行する.

```bash
# マイグレーション用イメージをビルド & push
docker build -t lostitem-migrate -f ./web/Dockerfile.migrate ./web
docker tag lostitem-migrate:latest <ecr_repository_url>:migrate
docker push <ecr_repository_url>:migrate

# App Runner経由で一時的に実行（VPC内のRDSに接続可能）
aws apprunner start-deployment --service-arn "$SERVICE_ARN"
```

> 初回デプロイ時やスキーマ変更時に, アプリのデプロイ前にマイグレーションを実行する.
> ローカルからRDSに直接接続できない場合は, マイグレーション用のイメージをApp Runnerで一時的に実行するか,
> EC2踏み台/SSMセッション経由で `DATABASE_URL=... npx prisma migrate deploy` を実行する.

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

バックエンドのS3バケットは手動で削除する:

```bash
aws s3 rb s3://lostitem-tfstate-xxx --force
```
