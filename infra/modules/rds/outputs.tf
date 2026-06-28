output "endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.this.endpoint
}

output "database_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.endpoint}/${var.db_name}"
  sensitive   = true
}

output "security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}
