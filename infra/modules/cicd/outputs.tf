output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "codebuild_migrate_project_name" {
  description = "CodeBuild migration project name"
  value       = aws_codebuild_project.migrate.name
}

output "migrate_source_bucket" {
  description = "S3 bucket for migration source"
  value       = aws_s3_bucket.migrate_source.bucket
}
