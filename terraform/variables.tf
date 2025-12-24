variable "aws_region" {
  default = "us-east-1"
}

variable "existing_instance_id" {
  description = "Existing EC2 instance ID"
}

variable "app_port" {
  default = 3000
}

