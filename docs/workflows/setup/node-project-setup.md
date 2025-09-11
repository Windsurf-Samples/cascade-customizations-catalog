---
description: Complete setup workflow for a new Node.js project with TypeScript and testing
---

This workflow guides you through setting up a professional Node.js project with TypeScript, testing, and development tools.

## Steps

1. Initialize the project
```bash
npm init -y
```

2. Install TypeScript and development dependencies
```bash
npm install -D typescript @types/node ts-node nodemon
npm install -D jest @types/jest ts-jest
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

3. Create TypeScript configuration
```bash
npx tsc --init
```

4. Set up project structure
```bash
mkdir src tests
touch src/index.ts tests/index.test.ts
```

5. Configure package.json scripts
Add these scripts to package.json:
- "dev": "nodemon src/index.ts"
- "build": "tsc"
- "start": "node dist/index.js"
- "test": "jest"
- "lint": "eslint src/**/*.ts"
- "format": "prettier --write src/**/*.ts"

6. Create basic configuration files
- .gitignore (include node_modules, dist, .env)
- .eslintrc.js with TypeScript rules
- .prettierrc with formatting preferences
- jest.config.js for testing configuration

7. Set up environment variables
```bash
touch .env .env.example
```

8. Initialize git repository
```bash
git init
git add .
git commit -m "Initial project setup"
```

The project is now ready for development with TypeScript, testing, and code quality tools configured.
