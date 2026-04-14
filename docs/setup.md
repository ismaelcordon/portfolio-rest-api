# Project Setup

## Overview

This project is built using **Node.js**, **Express**, and **TypeScript**.

The setup is designed to:

- Use TypeScript for type safety and maintainability
- Separate development and production workflows
- Support path aliases
- Keep build output clean and runnable in production

---

## Stack

- Node.js
- Express
- TypeScript
- Nodemon (development)
- tsc-alias (build step)

---

## Project Initialization

The project was initialized as a Node.js application and later configured to use TypeScript.

### Install dependencies

```bash
npm install express
```

### Install dev dependencies

```bash
npm install -D typescript @types/node @types/express nodemon tsc-alias
```

### Initialize TypeScript

```bash
npx tsc --init
```

This generates the `tsconfig.json` file, which defines the TypeScript compiler configuration.

---

## Project Structure

```text
src/     → TypeScript source code
dist/    → Compiled JavaScript output
```

- All source code lives inside `src/`
- The compiled output is generated in `dist/`
- Production runs only from `dist/`

---

## Path Aliases

This project uses TypeScript path aliases to simplify imports across the codebase.

Example aliases are defined in `tsconfig.json`.

Example:

```json
{
    "compilerOptions": {
        "baseUrl": "./src",
        "paths": {
            "#controllers/*": ["controllers/*"],
            "#services/*": ["services/*"],
            "#routes/*": ["routes/*"]
        }
    }
}
```

This makes imports cleaner and easier to maintain than long relative paths.

## Scripts

```json
{
    "scripts": {
        "dev": "nodemon --watch src --exec ts-node src/server.ts",
        "build": "tsc && tsc-alias",
        "start": "node dist/server.js"
    }
}
```

---

## Development Workflow

```text
npm run dev
```

- Runs the application using Nodemon
- Watches for file changes
- Executes TypeScript directly (no build required)

---

## Build Process

```text
npm run build
```

Steps:

1. `tsc` compiles TypeScript → JavaScript into `dist/`
2. `tsc-alias` resolves path aliases in the compiled files

---

## Why `tsc-alias` is needed

This project uses TypeScript path aliases with the `#` prefix.

Example:

```ts
import { getPosts } from "#services/posts";
```

TypeScript can understand these aliases during development when they are configured in `tsconfig.json`, but the compiled JavaScript output does not automatically rewrite them into relative paths that Node.js can resolve at runtime.

Without `tsc-alias`, imports using `#...` may fail in production after compilation.

`tsc-alias` rewrites aliased imports in the compiled `dist/` output into valid relative paths, allowing the application to run correctly in production.

## Production Execution

```text
npm run start
```

- Runs the compiled JavaScript from `dist/`
- No TypeScript execution in production
- No nodemon

---

## Notes

- `src/` should never be executed directly in production
- Always run `npm run build` before deploying
- Path aliases using `#` must be kept in sync with `tsconfig.json`
- Any change in build or runtime setup should be documented here
