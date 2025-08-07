resource "aws_instance" "lift-backend" {

  ami           = "ami-0e35ddab05955cf57"
  instance_type = "t2.micro"
  tags = {
    Name = "lift-backend-terraform"
  }

  security_groups = [aws_security_group.lift_backend_sg.name]

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
cd /home/ubuntu/app/backend

# Install dependencies
pnpm install

# Install PM2 globally
sudo npm install -g pm2

# Start the application (use absolute paths)
pm2 start pnpm --name "lift-backend" -- start

# Configure PM2 to start on boot
pm2 startup | grep -v "sudo" | bash
pm2 save

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


resource "aws_security_group" "lift_backend_sg" {
  name        = "lift-backend-sg"
  description = "Security group for Lift Backend"

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
    from_port   = 3002
    to_port     = 3002
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
    Name = "lift-backend-security-group"
  }
}
