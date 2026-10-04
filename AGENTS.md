# Development workflow

- Before changing code or project configuration, create a new branch from the latest `develop`.
- Do not commit directly to `main` or `develop`.
- Before committing, present the proposed commit boundaries and explain the intent of each commit.
- Stop before committing so the user can choose the granularity. Commit only after the user instructs you to proceed.
- When reporting commits, explain the intent and scope of each one.
- Merge and push only within the scope requested by the user.

# Formatting

- Use the project's pinned Oxfmt version: `npm run format`.
- Run `npm run format:check` before handing off changes.
- Keep formatting-only changes separate from behavior changes.
- Preserve the vendored and generated files excluded in `.oxfmtrc.json`.
- Keep ESLint for linting; Oxfmt is responsible for formatting only.
