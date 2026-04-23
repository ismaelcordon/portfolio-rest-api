# Portfolio API

Backend for my personal project, responsible for managing and serving blog content, as well as handling private editor functionalities.

## Stack

- Node.js
- Express
- TypeScript

## Description

This API provides:

- Public endpoints to fetch blog posts
- Private endpoints to create, update, and delete content
- Authentication for the admin/editor panel
- A foundation for future project features

## Base URL

- Local: `http://localhost:3000`
- Production: `https://ismaelcordon.com/portfolio/api`

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm run start
```

## Project Structure

```text
src/
  controllers/
  database/
  models/
  middlewares/
  services/
  routes/
  utils/
  validators/
  app.ts
  server.ts

dist/
```

## Scripts

Example scripts in `package.json`:

```json
{
    "scripts": {
        "dev": "nodemon --watch src --exec ts-node src/server.ts",
        "build": "tsc && tsc-alias",
        "start": "node dist/server.js"
    }
}
```

## Documentation

All technical documentation can be found in the `docs/` folder:

- `docs/setup.md` → project setup (TypeScript, environment, etc.)
- `docs/architecture.md` → structure and organization
- `docs/responses.md` → response format
- `docs/endpoints.md` → available endpoints
- `docs/deployment.md` → automated deployment

## Notes

- All API responses follow a unified structure.
- Private endpoints require authentication.
- Documentation should be updated with any relevant changes.

## Status

Project under active development.
