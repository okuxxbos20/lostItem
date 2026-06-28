output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "app_runner_service_url" {
  description = "App Runner service URL"
  value       = module.apprunner.service_url
}

output "app_runner_service_arn" {
  description = "App Runner service ARN"
  value       = module.apprunner.service_arn
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3.bucket_name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions (set as GitHub secret AWS_ROLE_ARN)"
  value       = module.cicd.github_actions_role_arn
}

output "migrate_source_bucket" {
  description = "S3 bucket for migration source (set as GitHub secret MIGRATE_SOURCE_BUCKET)"
  value       = module.cicd.migrate_source_bucket
}
