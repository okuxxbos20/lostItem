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

output "vpc_id" {
  description = "VPC ID"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "Subnet IDs"
  value       = data.aws_subnets.default.ids
}
