terraform {
  backend "s3" {
    bucket  = "lostitem-tfstate-jrt-fujiyoshi"
    key     = "prod/terraform.tfstate"
    region  = "ap-northeast-1"
    profile = "jr_tokai"
    encrypt = true
  }
}
