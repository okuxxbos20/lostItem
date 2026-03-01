module "iam" {
  source = "../../modules/iam"

  project_name  = var.project_name
  s3_bucket_arn = module.s3.bucket_arn
}
