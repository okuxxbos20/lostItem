variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "ecr_access_role_arn" {
  description = "IAM role ARN for ECR access"
  type        = string
}

variable "instance_role_arn" {
  description = "IAM role ARN for App Runner instance"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL connection URL"
  type        = string
  sensitive   = true
}

variable "s3_bucket" {
  description = "S3 bucket name for image storage"
  type        = string
}
