---
trigger: always_on
description: Security best practices to follow in all code development
labels: security, always-on, best-practices
author: Windsurf Team
modified: 2025-11-07
---

# Secure Coding Practices

## Description

Security best practices to follow in all code development.

Always prioritize security in code development:
- Never hardcode sensitive information like API keys, passwords, or tokens
- Use environment variables for configuration and secrets
- Implement proper input validation and sanitization
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization checks
- Follow the principle of least privilege
- Keep dependencies updated and scan for vulnerabilities
- Use HTTPS for all external communications
- Implement proper error handling without exposing sensitive information
