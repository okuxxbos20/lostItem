output "service_url" {
  description = "App Runner service URL"
  value       = aws_apprunner_service.this.service_url
}

output "service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.this.arn
}

output "security_group_id" {
  description = "App Runner VPC Connector security group ID"
  value       = aws_security_group.apprunner.id
}
