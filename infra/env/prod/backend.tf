terraform {
  backend "s3" {
    bucket         = "lostitem-tfstate-xxx"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "lostitem-tflock"
    encrypt        = true
  }
}
