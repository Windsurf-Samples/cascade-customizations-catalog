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

## Current Structure Issues

The current repository structure has several critical problems for enterprise cataloging and team distribution:

### 1. **Dual Directory Maintenance Overhead**
The repository maintains two parallel directory systems:
- `.windsurf/` - Contains actual rule and workflow files that users copy
- `docs/` - Contains documentation versions with different metadata formats

This creates significant maintenance burden as every change requires updating both locations with different formatting and metadata structures.

### 2. **Hardcoded File Management**
The web UI uses hardcoded file paths in `web-ui/js/core/DataLoader.js`, requiring manual updates to a predefined file list every time new customizations are added. This makes scaling and maintenance difficult.

### 3. **Category-Based Organization Scatters Team Resources**
The current structure organizes files by technical category (language, framework, security) rather than by team or use case. This forces teams to hunt across multiple directories to find all relevant customizations for their workflow.

### 4. **Poor Bundle Distribution**
Teams cannot easily copy a coherent set of related customizations. Instead, they must manually identify and copy individual files scattered across the category-based structure.

## Proposed Optimal Structure

### Option 1: Team-Focused Bundles (Recommended)

```
bundles/
├── frontend-team/
│   ├── .windsurf/
│   │   ├── rules/
│   │   │   ├── react-best-practices.md
│   │   │   ├── typescript-standards.md
│   │   │   └── code-review-checklist.md
│   │   └── workflows/
│   │       ├── component-setup.md
│   │       └── testing-workflow.md
│   ├── bundle.yaml              # Team info, dependencies, usage notes
│   └── README.md               # Team-specific documentation
├── backend-team/
│   ├── .windsurf/
│   │   ├── rules/
│   │   │   ├── java-guidelines.md
│   │   │   ├── api-design.md
│   │   │   └── security-practices.md
│   │   └── workflows/
│   │       ├── service-setup.md
│   │       └── deployment.md
│   ├── bundle.yaml
│   └── README.md
├── security-team/
│   ├── .windsurf/
│   │   └── rules/
│   │       ├── secure-coding.md
│   │       ├── vulnerability-checks.md
│   │       └── compliance-review.md
│   ├── bundle.yaml
│   └── README.md
└── devops-team/
    ├── .windsurf/
    │   ├── rules/
    │   │   └── infrastructure-as-code.md
    │   └── workflows/
    │       ├── ci-cd-setup.md
    │       └── monitoring-setup.md
    ├── bundle.yaml
    └── README.md
```

**Benefits:**
- Teams can copy entire `bundles/frontend-team/.windsurf/` directory to their workspace
- Related customizations are co-located and maintained together
- Bundle manifests provide metadata without dual directory overhead
- Clear navigation path for different team types
- Scales naturally as organizations add new team types

### Option 2: Category-Based with Embedded .windsurf

```
categories/
├── frontend/
│   ├── react/
│   │   └── .windsurf/
│   │       └── rules/
│   │           ├── component-patterns.md
│   │           └── hooks-best-practices.md
│   ├── typescript/
│   │   └── .windsurf/
│   │       └── rules/
│   │           ├── type-safety.md
│   │           └── strict-config.md
│   └── testing/
│       └── .windsurf/
│           └── workflows/
│               └── frontend-testing.md
├── backend/
│   ├── java/
│   │   └── .windsurf/
│   │       └── rules/
│   │           ├── coding-standards.md
│   │           └── spring-patterns.md
│   └── apis/
│       └── .windsurf/
│           └── rules/
│               └── rest-design.md
└── security/
    └── .windsurf/
        └── rules/
            ├── secure-coding.md
            └── vulnerability-scanning.md
```

**Benefits:**
- Maintains technical categorization for browsing
- Each category has its own `.windsurf` directory for easy copying
- Eliminates dual directory system
- Allows teams to copy specific technology stacks

## Browse the Catalog

### 🌐 Web Interface
**[Browse the Catalog Online](https://windsurf-samples.github.io/cascade-customizations-catalog/web-ui/index.html)**

Use our interactive web interface to browse and discover customizations for your enterprise catalog. The web catalog provides:

- **Search and Filter**: Find customizations by name, category, or keywords
- **Live Preview**: View rule and workflow content directly in the browser
- **Easy Copy**: One-click copying of customization files
- **Category Navigation**: Browse by framework, language, or use case
- **Bundle Organization**: See how customizations can be grouped for team distribution

## Getting Started

### For Enterprise Teams
1. **Study the Structure**: Examine the proposed bundle organization to understand team-focused distribution
2. **Adapt for Your Organization**: Create your own internal catalog using the recommended structure
3. **Create Team Bundles**: Group related customizations into team-specific `.windsurf` directories
4. **Distribute to Teams**: Teams copy entire bundle directories to their Windsurf workspaces
5. **Maintain Centrally**: Update bundles in your catalog and teams can pull updates as needed

### For Individual Use
1. **Browse Online**: Visit the [web catalog](https://windsurf-samples.github.io/cascade-customizations-catalog/web-ui/index.html) to explore available customizations
2. **Local Browsing**: Browse the `.windsurf/rules/` and `.windsurf/workflows/` directories directly
3. **Copy to Workspace**: Copy relevant `.md` files to your project's `.windsurf/` directory
4. **Learn More**: Refer to the [Windsurf documentation](https://docs.windsurf.com/windsurf/cascade/workflows) for more information

## Implementation Recommendations

To implement the proposed structure in your organization:

1. **Eliminate Dual Directory System**: Maintain only `.windsurf/` directories with embedded metadata
2. **Use Dynamic File Discovery**: Replace hardcoded file lists with directory scanning
3. **Create Bundle Manifests**: Use `bundle.yaml` files to define team metadata and dependencies
4. **Implement Bundle Versioning**: Track bundle versions for controlled distribution
5. **Add Bundle Testing**: Validate that bundle combinations work together correctly

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
