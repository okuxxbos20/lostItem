data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "apprunner" {
  name        = "${var.project_name}-apprunner"
  description = "Security group for App Runner VPC Connector"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_apprunner_vpc_connector" "this" {
  vpc_connector_name = "${var.project_name}-vpc-connector"
  subnets            = data.aws_subnets.default.ids
  security_groups    = [aws_security_group.apprunner.id]
}

resource "aws_apprunner_service" "this" {
  service_name = var.project_name

  source_configuration {
    authentication_configuration {
      access_role_arn = var.ecr_access_role_arn
    }

    image_repository {
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          DATABASE_URL = var.database_url
          S3_BUCKET    = var.s3_bucket
          S3_REGION    = var.aws_region
        }
      }
      image_identifier      = "${var.ecr_repository_url}:latest"
      image_repository_type = "ECR"
    }

    auto_deployments_enabled = false
  }

  instance_configuration {
    instance_role_arn = var.instance_role_arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.this.arn
    }
  }
}
