resource "aws_instance" "lift-frontend" {

  ami           = "ami-0e35ddab05955cf57"
  instance_type = "t2.micro"
  tags = {
    Name = "lift-frontend-terraform"
  }

  security_groups = [aws_security_group.lift_frontend_sg.name]

  user_data = <<-EOF
#!/bin/bash
# Update package lists
sudo apt-get update -y

# Install Git
sudo apt-get install git -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PNPM
sudo npm install -g pnpm

# Clone the repository (use HTTPS or SSH)
git clone https://github.com/rakeshkanneeswaran/smartliftsystemversion-2.git /home/ubuntu/app
cd /home/ubuntu/app/display/my-app

# Install dependencies
pnpm install

# Install PM2 globally
sudo npm install -g pm2




# Verify installations
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PNPM version: $(pnpm -v)"
echo "Git version: $(git --version)"
echo "PM2 version: $(pm2 --version)"
EOF


  lifecycle {
    ignore_changes = [ami] # Prevent AMI updates from forcing replacement
  }

}




resource "aws_security_group" "lift_frontend_sg" {
  name        = "lift-frontend-sg"
  description = "Security group for Lift Frontend"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lift-frontend-security-group"
  }
}
