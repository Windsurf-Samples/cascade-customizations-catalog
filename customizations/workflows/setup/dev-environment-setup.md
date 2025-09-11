---
description: Complete development environment setup workflow for new team members or fresh machines
---

This workflow guides you through setting up a complete development environment from scratch, including essential tools, configurations, and team-specific requirements.

## Prerequisites Check

1. Verify system requirements
```bash
# Check OS version and architecture
uname -a
# Check available disk space (need at least 10GB free)
df -h
```

## Core Development Tools

2. Install package manager (if not present)
```bash
# macOS - Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Linux - Update package manager
sudo apt update && sudo apt upgrade -y
```

3. Install essential development tools
```bash
# Git version control
brew install git  # macOS
sudo apt install git  # Linux

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"
git config --global init.defaultBranch main
```

4. Install Node.js and package managers
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default node

# Verify installations
node --version
npm --version
```

## Code Editor Setup

5. Install and configure VS Code (or team editor)
```bash
# macOS
brew install --cask visual-studio-code

# Linux
sudo snap install code --classic
```

6. Install essential VS Code extensions
```bash
# Install via command line
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
```

## Language-Specific Setup

7. Install language runtimes (as needed)
```bash
# Python
brew install python3 pipenv  # macOS
sudo apt install python3 python3-pip  # Linux

# Java
brew install openjdk@11  # macOS
sudo apt install openjdk-11-jdk  # Linux

# Docker
brew install docker docker-compose  # macOS
# Follow Docker installation guide for Linux
```

## Database and Services

8. Install development databases
```bash
# PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql postgresql-contrib  # Linux

# Redis (for caching)
brew install redis  # macOS
sudo apt install redis-server  # Linux

# Start services
brew services start postgresql redis  # macOS
sudo systemctl start postgresql redis  # Linux
```

## Team-Specific Configuration

9. Clone team repositories
```bash
# Create workspace directory
mkdir -p ~/workspace
cd ~/workspace

# Clone main project repository
git clone https://github.com/company/main-project.git
cd main-project

# Install project dependencies
npm install
```

10. Set up environment variables
```bash
# Copy environment template
cp .env.example .env

# Edit with team-specific values
# (Get values from team lead or documentation)
```

## Development Workflow Tools

11. Install additional productivity tools
```bash
# Terminal enhancements
brew install zsh oh-my-zsh  # macOS
sudo apt install zsh  # Linux

# API testing
brew install --cask postman  # macOS

# Database management
brew install --cask dbeaver-community  # macOS
```

## Verification and Testing

12. Verify development environment
```bash
# Test Node.js project build
npm run build

# Test database connection
npm run db:test

# Run test suite
npm test

# Start development server
npm run dev
```

13. Create first commit to verify Git setup
```bash
# Make a small change (like updating README)
echo "# Development Environment Setup Complete" >> SETUP.md
git add SETUP.md
git commit -m "docs: verify development environment setup"
git push origin main
```

## Final Configuration

14. Set up team communication tools
- Install Slack/Discord/Teams
- Join team channels
- Set up notifications preferences

15. Access team resources
- Bookmark team documentation
- Get access to shared drives/wikis
- Set up VPN if required
- Configure company SSO

Your development environment is now ready! Contact your team lead if you encounter any issues during setup.
