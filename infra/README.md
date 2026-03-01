# インフラストラクチャ

Terraformを使用してAWSリソースを構築する.

## 構成するAWSリソース

| リソース | 用途 |
|---------|------|
| ECR | Dockerイメージのレジストリ |
| App Runner | アプリケーションの実行環境 |
| RDS (PostgreSQL) | データベース |
| S3 | 画像ファイルの保存 |
| IAM | アクセス制御 |
| VPC Connector | App RunnerからRDSへの接続 |

## ネットワーク構成

```
[ユーザー] → [App Runner] → [RDS (PostgreSQL)]
                  ↓
               [S3 (画像)]
```

- App RunnerはVPCコネクタ経由でRDSに接続
- App RunnerからS3へはインスタンスロールで認証

## 事前準備

AWSリソースの詳細な準備手順は [docs/aws.md](../docs/aws.md) を参照.
