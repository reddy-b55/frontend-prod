data "aws_instance" "existing_ec2" {
  instance_id = var.existing_instance_id
}

