module "cicd" {
  source = "../../modules/cicd"

  project_name          = var.project_name
  aws_region            = var.aws_region
  github_repository     = "okuxxbos20/lostItem"
  ecr_repository_url    = module.ecr.repository_url
  database_url          = module.rds.database_url
  vpc_id                = module.apprunner.vpc_id
  subnet_ids            = module.apprunner.subnet_ids
  rds_security_group_id = module.rds.security_group_id
  app_runner_service_arn = module.apprunner.service_arn
}
