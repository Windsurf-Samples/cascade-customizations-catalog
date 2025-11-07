# Contributing to Cascade Customizations Catalog

Thank you for your interest in contributing to the Cascade Customizations Catalog repository! This guide will help you understand how to contribute effectively.

## How to Contribute

### 1. Types of Contributions

We welcome two types of customizations:

- **Rules**: Influence Cascade's behavior in specific contexts
- **Workflows**: Step-by-step procedures for complex tasks

### 2. Contribution Requirements

For each customization you contribute, you must provide:

1. **The customization file** in the appropriate `customizations/` directory with proper metadata
2. **Proper categorization** using our standardized labels

### 3. File Structure

#### Rules
- Place rule files in: `customizations/rules/<category>/<rule-name>.md`

#### Workflows  
- Place workflow files in: `customizations/workflows/<category>/<workflow-name>.md`

### 4. Categories

You may use these suggested top-level categories for organization:

**Rules:**
- `language/` - Language-specific rules (typescript.md, python.md, etc.)
- `framework/` - Framework-specific rules (react.md, vue.md, etc.)
- `general/` - General-purpose rules
- `security/` - Security-focused rules
- `style/` - Code style and formatting rules
- `testing/` - Testing-related rules

**Workflows:**
- `setup/` - Project setup workflows
- `testing/` - Testing workflows
- `deployment/` - Deployment workflows
- `maintenance/` - Maintenance workflows

### 5. Metadata Requirements

Each customization file must include YAML frontmatter with metadata:

**For Rules:**
```yaml
---
trigger: model_decision|glob|always_on|manual
globs: "*.ts,*.tsx"  # Only for glob-based rules
description: Brief description of what this rule does
labels: [comma, separated, labels]
author: [Your name/username]
modified: [YYYY-MM-DD]
---
```

**For Workflows:**
```yaml
---
description: Brief description of what this workflow does
labels: [comma, separated, labels]
author: [Your name/username]
modified: [YYYY-MM-DD]
---
```

Followed by:
- **H1 Title**: The name of the customization
- **Description Section**: What the customization does
- **Usage Section**: How and when to use it
- **Examples Section**: Practical code examples

#### Required Sections

```markdown
# [Customization Name]

## Description

[Detailed description of what this customization does]

## Usage

[How and when to use this customization]

## Examples

[Practical examples of the customization in action]
```

#### Labels

Use standardized labels for consistent categorization. Labels help users discover your customizations through search and filtering. Common labels include:
- **Languages**: javascript, typescript, python, java, etc.
- **Frameworks**: react, vue, angular, nextjs, etc.
- **Areas**: frontend, backend, security, testing, etc.
- **Activation**: always-on, model-decision, glob-based, manual

### 6. Quality Guidelines

- **Clear and concise**: Write customizations that are easy to understand
- **Well-documented**: Provide comprehensive documentation with examples
- **Tested**: Ensure your customizations work as expected
- **Specific**: Target specific use cases rather than being overly generic
- **Follow conventions**: Use consistent naming and formatting

### 7. Submission Process

1. Fork the repository
2. Create a new branch for your contribution
3. Add your customization file to the appropriate directory (e.g., `customizations/rules/style/my-rule.md`)
4. Add the filename (without `.md` extension) to `web-ui/js/utils/DirectoryScanner.js` in the `getCommonFilenames()` method
5. Ensure proper labeling and categorization
6. Test your customization locally
7. Submit a pull request

**Example:** If you add `customizations/rules/style/my-new-rule.md`, update DirectoryScanner.js:
```javascript
'style': ['frontend-format', 'code-review-checklist', 'coding-best-practices', 'my-new-rule']
```

### 8. Pull Request Requirements

Your PR must include:
- [ ] Customization file in correct `customizations/rules/` or `customizations/workflows/` location
- [ ] Proper YAML frontmatter with all required metadata
- [ ] Clear description of the customization's purpose
- [ ] Usage instructions and examples in the file
- [ ] Appropriate labels for categorization

### 9. Review Process

All contributions will be reviewed for:
- Functionality and correctness
- Documentation quality
- Proper categorization
- Adherence to community guidelines

### 10. Code of Conduct

- Be respectful and constructive in all interactions
- Focus on helping the community
- Provide helpful feedback during reviews
- Follow the established conventions

## Getting Help

If you need help with your contribution:
- Check existing examples in the repository
- Review the [Windsurf documentation](https://docs.windsurf.com)
- Open an issue for questions

## Recognition

Contributors will be recognized in the repository and their contributions will help the entire Windsurf community build better software with Cascade.

Thank you for contributing! 🚀
