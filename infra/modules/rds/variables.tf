variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "apprunner_sg_id" {
  description = "Security group ID of the App Runner VPC Connector"
  type        = string
}
