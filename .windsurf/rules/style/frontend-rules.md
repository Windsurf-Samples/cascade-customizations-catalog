---
title: "Frontend rules"
description: "frontend rules for when coding"
category: "style"
labels: ["frontend", "beginner"]
author: "Community Contribution"
modified: "2025-11-07"
---

---
trigger: model_decision
description: Use these rules when working on the website.
---

# General Code Style & Formatting
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Expo's official documentation for setting up and configuring projects.

# Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

# TypeScript Best Practices
- Use TypeScript for all code; prefer interfaces over types.
- Avoid any and enums; use explicit types and maps instead.
- Use functional components with TypeScript interfaces.
- Enable strict mode in TypeScript for better type safety.

# Syntax & Formatting
- Use the function keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.

# Styling & UI
- Use Expo's built-in components for common UI patterns and layouts.
- Implement responsive design with Flexbox and useWindowDimensions.
- Use styled-components or Tailwind CSS for styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Use react-native-reanimated and react-native-gesture-handler for performant animations and gestures.
