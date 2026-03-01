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
