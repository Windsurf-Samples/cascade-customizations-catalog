---
title: "Development Environment Setup"
description: "Standardized development environment setup for backend services"
author: "Backend Team"
labels: ["development", "environment", "setup", "backend"]
category: "Setup"
modified: "2024-01-15"
---

Development environment setup workflow for backend services:

## Prerequisites
- Java 11 or higher
- Maven or Gradle
- IDE (IntelliJ IDEA, Eclipse, or VS Code)
- Git

## Steps

1. Install Java Development Kit
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# On macOS with Homebrew
brew install openjdk@11
```

2. Install Maven
```bash
# On Ubuntu/Debian
sudo apt install maven

# On macOS with Homebrew
brew install maven
```

3. Configure IDE
- Install Java extensions/plugins
- Configure code formatting rules
- Set up debugging configuration
- Install Git integration

4. Clone project repository
```bash
git clone <repository-url>
cd <project-directory>
```

5. Install project dependencies
```bash
mvn clean install
```

6. Set up database (if applicable)
- Install database server (PostgreSQL, MySQL, etc.)
- Create development database
- Run migration scripts

7. Configure environment variables
```bash
cp .env.example .env
# Edit .env with appropriate values
```

8. Run tests to verify setup
```bash
mvn test
```

9. Start the application
```bash
mvn spring-boot:run
```

The development environment is now ready for backend development.
