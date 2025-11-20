# Cascade Customizations Catalog

A reference repository for organizing and distributing Windsurf Cascade customizations within organizations. This catalog demonstrates how enterprises can structure, catalog, and distribute proprietary Rules and Workflows to their development teams.

## Purpose

This repository serves as a **reference model for enterprise teams** to organize and distribute Cascade customizations across their organization. While it includes community examples, the primary purpose is to provide a blueprint for:

- **Internal customization catalogs** that enterprises can adapt for their proprietary rules and workflows
- **Standardized organization** that makes it easy for teams to find and copy relevant `.windsurf` configurations
- **Scalable maintenance** of customization libraries as organizations grow

Development teams can copy `.windsurf` rules and workflows directly into their Windsurf workspaces, enabling consistent AI behavior across projects and team members.

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

## Browse the Catalog

### Google Doc with Examples
**(https://docs.google.com/document/d/1W51klY_JnO5uk5A85w5b1lqF_WHHfNo3ZouVEKfDMS8/edit?usp=sharing)**

### 🌐 Web Interface
**[Browse the Catalog Online](https://cognitionteam20scavenger.github.io/cascade-customizations-catalog/web-ui/index.html)**

Use our interactive web interface to explore customizations. The web catalog provides:

- **Modern UI**: Clean, professional design with Windsurf branding and excellent readability
- **Search and Filter**: Find customizations by technology, category, or keywords
- **Color-Coded Tags**: Automatic color generation for tags - every tag gets a unique, vibrant color
- **Live Preview**: View rule and workflow content directly in the browser with syntax highlighting
- **Easy Download**: Download individual customizations with proper formatting for Windsurf
- **Copy to Clipboard**: Quickly copy customization content for use in your projects
- **Metadata Display**: See author, creation date, and modification date for each customization
- **Submit New Customizations**: Built-in form to contribute new rules and workflows via GitHub PR

## Getting Started

### Using Customizations

#### 1. Browse the Catalog
Visit the [web catalog](https://cognitionteam20scavenger.github.io/cascade-customizations-catalog/web-ui/index.html) to explore available rules and workflows. Use the search and filter features to find customizations relevant to your development needs.

#### 2. Download or Copy Customizations
- Click on any customization card to view its full content in a modal
- Use the **Download** button to save the file with Windsurf-ready formatting (strips catalog metadata)
- Use the **Copy** button to copy the content directly to your clipboard
- View all metadata including author, tags, and last modified date

#### 3. Add to Your Workspace
Place the downloaded customization files in your project's `.windsurf` directory:

```bash
# Create the directories if they don't exist
mkdir -p /path/to/your/project/.windsurf/rules
mkdir -p /path/to/your/project/.windsurf/workflows

# Copy the downloaded files to the appropriate directory
cp "Downloaded Rule.md" /path/to/your/project/.windsurf/rules/
cp "Downloaded Workflow.md" /path/to/your/project/.windsurf/workflows/
```

#### 4. Customize for Your Project
- Review each rule and workflow for relevance to your project
- Modify activation modes if needed (e.g., change glob patterns for rules)
- Adjust content based on your team's specific needs and coding standards

### For Enterprise Teams
1. **Use as Reference**: Study the catalog organization to understand how to structure customizations
2. **Adapt Structure**: Create your own internal catalog following similar patterns
3. **Distribute Customizations**: Share relevant rules and workflows across your organization
4. **Version Control**: Track customization versions and maintain them in your own repository

### For Individual Use
1. **Browse Online**: Visit the [web catalog](https://cognitionteam20scavenger.github.io/cascade-customizations-catalog/web-ui/index.html) to explore available customizations
2. **Selective Use**: Download and use specific rules or workflows that match your development needs
3. **Learn More**: Refer to the [Windsurf documentation](https://docs.windsurf.com/windsurf/cascade/workflows) for more information

## How to Find and Use Customizations

### Finding Rules and Workflows

#### By Type
- **Rules**: Automated coding guidelines that influence AI behavior (found in `.windsurf/rules/`)
- **Workflows**: Step-by-step procedures accessible via `/workflow-name` (found in `.windsurf/workflows/`)

#### Using the Web Interface
1. **Filter by Type**: Use type filters to view only Rules or only Workflows
2. **Search by Technology**: Find customizations by language, framework, or tool
3. **Filter by Category**: Browse customizations organized by category (e.g., code-quality, security, testing)
4. **Preview Content**: Click any customization to view its full content and usage instructions
5. **Download**: Use the download button to save customizations with proper formatting

### Understanding Activation Modes

Rules use different activation modes:

- **Always-On**: Applied to every user message (e.g., security practices)
- **Model-Decision**: Cascade chooses when to apply based on context (e.g., React patterns)
- **Glob-Based**: Applied to files matching patterns (e.g., `*.ts,*.tsx` for TypeScript rules)
- **Manual**: Applied only when explicitly requested by users (e.g., code review checklists)

## Contributing

This repository serves as a reference model for enterprise cataloging. While we welcome community contributions of example customizations, the primary value is in the organizational structure and patterns demonstrated here.

### Submit via Web Interface
The easiest way to contribute is through our web interface:
1. Visit the [web catalog](https://cognitionteam20scavenger.github.io/cascade-customizations-catalog/web-ui/index.html)
2. Click the **"Submit New Customization"** button
3. Fill out the form with your rule or workflow details
4. The form will automatically:
   - Generate proper YAML frontmatter with metadata
   - Merge any existing frontmatter from pasted content
   - Create a GitHub PR with your contribution
   - Add your name as the author with today's date

### Manual Contribution
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to manually submit new example customizations or improvements to the catalog structure.

### Metadata Format
All customizations include YAML frontmatter with:
- `trigger`: Activation mode (for rules: always_on, model_decision, glob, manual)
- `globs`: File patterns (for glob-based rules)
- `description`: Brief description of the customization
- `labels`: Comma-separated tags for categorization
- `author`: Creator's name or username
- `modified`: Last modification date (YYYY-MM-DD)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Windsurf Website](https://windsurf.com)
- [Windsurf Documentation](https://docs.windsurf.com)
- [Windsurf Rules](https://docs.windsurf.com/windsurf/cascade/memories#rules)
- [Windsurf Workflows](https://docs.windsurf.com/windsurf/cascade/workflows)

---

*Made with ❤️ by the Windsurf community*
