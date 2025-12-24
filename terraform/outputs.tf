output "ec2_public_ip" {
  value = data.aws_instance.existing_ec2.public_ip
}

