variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL connection URL for migration"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC ID for CodeBuild migration"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for CodeBuild migration"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS security group ID"
  type        = string
}

variable "app_runner_service_arn" {
  description = "App Runner service ARN"
  type        = string
}
