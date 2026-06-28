# インフラストラクチャ

Terraformを使用してAWSリソースを構築する.

## アーキテクチャ図

[architecture.drawio](./architecture.drawio) を draw.io で開いて確認できる.

```
[ユーザー] → [App Runner] → [VPC Connector] → [RDS (PostgreSQL)]
                  ↓
               [S3 (画像)]

[GitLab CI/CD] → [ECR] → [App Runner]
```

- App RunnerはVPCコネクタ経由でRDSに接続
- App RunnerからS3へはインスタンスロールで認証
- GitLab CI/CDからECRにイメージをpushし, App Runnerのデプロイをトリガー

## 構成するAWSリソース

| リソース            | 用途                       |
| ------------------- | -------------------------- |
| ECR                 | Dockerイメージのレジストリ |
| App Runner          | アプリケーションの実行環境 |
| RDS (PostgreSQL 16) | データベース (db.t3.micro) |
| S3                  | 画像ファイルの保存         |
| IAM                 | App Runner用のアクセス制御 |
| VPC Connector       | App RunnerからRDSへの接続  |

## ディレクトリ構成

```
infra/
├── modules/
│   ├── ecr/            # ECRリポジトリ
│   ├── s3/             # S3バケット (画像保存)
│   ├── rds/            # RDS PostgreSQL
│   ├── iam/            # IAMロール・ポリシー
│   └── apprunner/      # App Runner + VPC Connector
├── env/
│   └── prod/
│       ├── ecr.tf            # ECRモジュール呼び出し
│       ├── s3.tf             # S3モジュール呼び出し
│       ├── iam.tf            # IAMモジュール呼び出し
│       ├── rds.tf            # RDSモジュール呼び出し
│       ├── apprunner.tf      # App Runnerモジュール呼び出し
│       ├── variables.tf      # 変数定義
│       ├── terraform.tfvars  # 環境固有の値 (gitignore)
│       ├── backend.tf        # S3バックエンド設定
│       ├── provider.tf       # AWSプロバイダ設定
│       └── outputs.tf        # 出力値
├── architecture.drawio       # アーキテクチャ図
└── README.md
```

## 事前準備: State管理のbootstrap

Terraform stateをS3で管理するため, 以下のリソースを **手動で** 作成する.

### 1. S3バケット (state保存用)

```bash
aws s3api create-bucket \
  --bucket lostitem-tfstate-xxx \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws s3api put-bucket-versioning \
  --bucket lostitem-tfstate-xxx \
  --versioning-configuration Status=Enabled
```

<!-- ### 2. DynamoDBテーブル (state lock用)

```bash
aws dynamodb create-table \
  --table-name lostitem-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
``` -->

### 3. backend.tfのバケット名を更新

`infra/env/prod/backend.tf` の `bucket` を実際に作成したバケット名に変更する.

## 使い方

### 初期化

```bash
cd infra/env/prod
terraform init
```

### terraform.tfvarsの設定

`infra/env/prod/terraform.tfvars` を作成し, 値を設定する:

```hcl
project_name = "lostItem"
aws_region   = "ap-northeast-1"
db_name      = "lostitem"
db_username  = "postgres"
db_password  = "安全なパスワードを設定"
s3_bucket    = "lostitem-images-xxx"  # グローバルで一意な名前
```

### プラン確認

```bash
terraform plan
```

### 適用

```bash
terraform apply
```

### 削除

```bash
terraform destroy
```

## GitLab CI/CD

mainブランチへのpush時 (`web/` 配下の変更) に自動でビルド・デプロイが実行される.

### 必要なGitLab CI/CD Variables

| Variable                | 説明                           |
| ----------------------- | ------------------------------ |
| `AWS_ACCESS_KEY_ID`     | AWSアクセスキー                |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットキー            |
| `AWS_DEFAULT_REGION`    | AWSリージョン (ap-northeast-1) |
| `AWS_ACCOUNT_ID`        | AWSアカウントID                |

### パイプライン

1. **build**: Docker build → ECR push (コミットSHA + latest タグ)
2. **deploy**: `aws apprunner start-deployment` で新イメージをデプロイ

## 事前準備 (詳細)

AWSリソースの詳細な準備手順は [docs/aws.md](../docs/aws.md) を参照.
