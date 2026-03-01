module "apprunner" {
  source = "../../modules/apprunner"

  project_name        = var.project_name
  aws_region          = var.aws_region
  ecr_repository_url  = module.ecr.repository_url
  ecr_access_role_arn = module.iam.apprunner_ecr_access_role_arn
  instance_role_arn   = module.iam.apprunner_instance_role_arn
  database_url        = module.rds.database_url
  s3_bucket           = module.s3.bucket_name
}
