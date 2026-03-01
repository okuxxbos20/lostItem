module "rds" {
  source = "../../modules/rds"

  project_name    = var.project_name
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password
  apprunner_sg_id = module.apprunner.security_group_id
}
