# Cascade Customizations Catalog

A reference repository for organizing and distributing Windsurf Cascade customizations within organizations. This catalog demonstrates how enterprises can structure, catalog, and distribute proprietary Rules and Workflows to their development teams.

## Purpose

This repository serves as a **reference model for enterprise teams** to organize and distribute Cascade customizations across their organization. While it includes community examples, the primary purpose is to provide a blueprint for:

- **Internal customization catalogs** that enterprises can adapt for their proprietary rules and workflows
- **Team-based distribution** of relevant customization bundles 
- **Standardized organization** that makes it easy for teams to find and copy relevant `.windsurf` configurations
- **Scalable maintenance** of customization libraries as organizations grow

Development teams can copy entire bundles of `.windsurf` rules and workflows directly into their Windsurf workspaces, enabling consistent AI behavior across projects and team members.

## What are Customizations?

Customizations in Cascade drive Cascade's behavior and fall under the categories of Rules or Workflows:

### Rules
Rules influence how Cascade responds to user prompts. Because not all rules should apply to every user prompt, there are four types of rule activation modes:

- **Always On**: Rules that apply to every user message
- **Model Decision**: Rules that Cascade chooses to apply based on the rule's description
- **Glob-based**: Rules that Cascade applies based on file patterns (such as `*.js`, `dir/*, dir/**/*.js`)
- **Manual**: Rules that users tell Cascade to apply as desired

These rules apply guidelines for the AI to follow during response generation.

### Workflows
Workflows are explicitly defined step-by-step procedures that help Cascade work through sequential tasks. Workflows are available via the /\<workflow-name> shortcut in the Text Box.

Workflows can be used for one time tasks like project setup or repeated tasks like testing procedures, deployment processes, debugging methodology, and more.

## Team-Focused Bundle Structure

The catalog is organized into team-focused bundles that group related customizations together for easy distribution and use. Each bundle contains a complete set of rules and workflows tailored for specific development teams.

### Available Team Bundles

#### 🎨 Frontend Team Bundle
**Location**: `bundles/frontend-team/`
- **Focus**: React/TypeScript development standards and workflows
- **Team Size**: 8-12 developers
- **Rules**: TypeScript best practices, React patterns, security practices, code review checklist
- **Workflows**: Node.js project setup
- **Use Cases**: Web applications, component libraries, single-page applications

#### ⚙️ Backend Team Bundle
**Location**: `bundles/backend-team/`
- **Focus**: Java/Spring backend development and deployment
- **Team Size**: 6-10 developers
- **Rules**: Java coding standards, security practices, code review checklist
- **Workflows**: Development environment setup, debugging procedures
- **Use Cases**: REST APIs, microservices, data processing

#### 🔒 Security Team Bundle
**Location**: `bundles/security-team/`
- **Focus**: Security-focused rules and compliance workflows
- **Team Size**: 3-5 security engineers
- **Rules**: Core secure coding practices for all languages
- **Workflows**: None (focuses on always-on security rules)
- **Use Cases**: Security reviews, compliance audits, vulnerability assessment

#### 🚀 DevOps Team Bundle
**Location**: `bundles/devops-team/`
- **Focus**: Infrastructure, deployment, and maintenance workflows
- **Team Size**: 4-8 engineers
- **Rules**: None (focuses on operational workflows)
- **Workflows**: Development environment setup, infrastructure debugging
- **Use Cases**: CI/CD, infrastructure management, monitoring, deployment

### Bundle Structure

Each team bundle follows a consistent structure:

```
bundles/{team-name}/
├── bundle.yaml          # Bundle manifest with dependencies and metadata
└── windsurf/           # Windsurf customizations directory
    ├── rules/          # Rule files (.md)
    └── workflows/      # Workflow files (.md)
```

### Bundle Manifest System

Each bundle includes a `bundle.yaml` manifest file that defines:

- **Dependencies**: Lists of rules and workflows with their activation modes
- **Activation Modes**: How rules are triggered (always-on, model-decision, glob-based, manual)
- **Metadata**: Team information, tags, use cases, and compatibility requirements
- **Versioning**: Bundle and dependency version tracking

Example manifest structure:
```yaml
name: "Frontend Development Team"
version: "1.0.0"
description: "React/TypeScript development standards and workflows"

dependencies:
  rules:
    - path: "windsurf/rules/typescript.md"
      activation: "glob"
      globs: "*.ts,*.tsx"
      description: "TypeScript best practices"
  workflows:
    - path: "windsurf/workflows/node-project-setup.md"
      description: "Node.js project initialization"

metadata:
  tags: ["frontend", "react", "typescript"]
  team_size: "8-12 developers"
  use_cases: ["web applications", "component libraries"]
```

## Browse the Catalog

### 🌐 Web Interface
**[Browse the Catalog Online](https://windsurf-samples.github.io/cascade-customizations-catalog/web-ui/index.html)**

Use our interactive web interface to explore team-focused bundles and individual customizations. The web catalog provides:

- **Bundle Navigation**: Browse complete team bundles with all their rules and workflows
- **Search and Filter**: Find customizations by team, technology, or keywords
- **Live Preview**: View rule and workflow content directly in the browser
- **Bundle Download**: Download entire team bundles or individual customizations
- **Manifest Viewer**: Inspect bundle dependencies, activation modes, and metadata
- **Team Organization**: See how customizations are organized by development team focus

## Getting Started

### Using Team Bundles

#### 1. Choose Your Team Bundle
Browse the available team bundles and select the one that matches your development focus:
- **Frontend Team**: React/TypeScript development
- **Backend Team**: Java/Spring backend services  
- **Security Team**: Security-focused practices
- **DevOps Team**: Infrastructure and deployment

#### 2. Copy Bundle to Your Workspace
Navigate to your chosen bundle and copy the entire `windsurf/` directory to your project:

```bash
# Copy entire bundle
cp -r bundles/frontend-team/windsurf/ /path/to/your/project/.windsurf/

# Or copy specific rules/workflows
cp bundles/frontend-team/windsurf/rules/typescript.md /path/to/your/project/.windsurf/rules/
cp bundles/frontend-team/windsurf/workflows/node-project-setup.md /path/to/your/project/.windsurf/workflows/
```

#### 3. Review Bundle Manifest
Check the `bundle.yaml` file to understand:
- Which rules will activate automatically vs. on-demand
- Activation modes (always-on, model-decision, glob-based, manual)
- Dependencies and compatibility requirements
- Team-specific metadata and use cases

#### 4. Customize for Your Project
- Review each rule and workflow for relevance to your project
- Modify activation modes if needed (e.g., change glob patterns)
- Add or remove customizations based on your team's specific needs

### For Enterprise Teams
1. **Use as Reference**: Study the bundle organization to understand team-focused distribution
2. **Adapt Structure**: Create your own internal catalog using the same bundle structure
3. **Create Custom Bundles**: Group your proprietary customizations into team-specific bundles
4. **Distribute Centrally**: Teams can copy entire bundle directories from your internal catalog
5. **Version Control**: Use the bundle manifest system to track versions and dependencies

### For Individual Use
1. **Browse Online**: Visit the [web catalog](https://windsurf-samples.github.io/cascade-customizations-catalog/web-ui/index.html) to explore bundles and individual customizations
2. **Local Browsing**: Browse the `bundles/{team-name}/windsurf/` directories directly
3. **Selective Copying**: Copy specific rules or workflows that match your development needs
4. **Learn More**: Refer to the [Windsurf documentation](https://docs.windsurf.com/windsurf/cascade/workflows) for more information

## How to Find and Use Customizations

### Finding Rules and Workflows

#### By Team Focus
Navigate directly to team-specific bundles:
- `bundles/frontend-team/windsurf/` - React/TypeScript development
- `bundles/backend-team/windsurf/` - Java/Spring backend services
- `bundles/security-team/windsurf/` - Security practices
- `bundles/devops-team/windsurf/` - Infrastructure and deployment

#### By Type
- **Rules** (`windsurf/rules/`): Automated coding guidelines that influence AI behavior
- **Workflows** (`windsurf/workflows/`): Step-by-step procedures accessible via `/workflow-name`

#### Using the Web Interface
1. **Filter by Team**: Use team bundle filters to see all customizations for a specific team
2. **Search by Technology**: Find customizations by language, framework, or tool
3. **Preview Content**: Click any customization to view its full content and usage instructions
4. **Download Options**: Copy individual files or download entire bundles

### Understanding Activation Modes

Rules in the bundles use different activation modes:

- **Always-On**: Applied to every user message (e.g., security practices)
- **Model-Decision**: Cascade chooses when to apply based on context (e.g., React patterns)
- **Glob-Based**: Applied to files matching patterns (e.g., `*.ts,*.tsx` for TypeScript rules)
- **Manual**: Applied only when explicitly requested by users (e.g., code review checklists)

### Bundle Dependencies

Each bundle's `bundle.yaml` file lists all included customizations with:
- File paths within the bundle
- Activation modes and glob patterns
- Version requirements
- Descriptions of each customization's purpose

## Contributing

This repository serves as a reference model for enterprise cataloging. While we welcome community contributions of example customizations, the primary value is in the organizational structure and patterns demonstrated here.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit new example customizations or improvements to the catalog structure.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Windsurf Website](https://windsurf.com)
- [Windsurf Documentation](https://docs.windsurf.com)
- [Windsurf Rules](https://docs.windsurf.com/windsurf/cascade/memories#rules)
- [Windsurf Workflows](https://docs.windsurf.com/windsurf/cascade/workflows)

---

*Made with ❤️ by the Windsurf community*
