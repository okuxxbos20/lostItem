output "apprunner_ecr_access_role_arn" {
  description = "ARN of the App Runner ECR access role"
  value       = aws_iam_role.apprunner_ecr_access.arn
}

output "apprunner_instance_role_arn" {
  description = "ARN of the App Runner instance role"
  value       = aws_iam_role.apprunner_instance.arn
}
