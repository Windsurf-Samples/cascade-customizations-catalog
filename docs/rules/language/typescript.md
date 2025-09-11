---
trigger: glob
globs: "*.ts,*.tsx"
---

When working with TypeScript files, always:
- Use explicit type annotations for function parameters and return types
- Prefer interfaces over type aliases for object shapes
- Use strict TypeScript configuration with noImplicitAny and strictNullChecks
- Implement proper error handling with Result types or custom error classes
- Use generic types for reusable components and functions
- Follow naming conventions: PascalCase for types/interfaces, camelCase for variables/functions
