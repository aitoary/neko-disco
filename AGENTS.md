# Development workflow

- Before changing code, project configuration, or repository instructions, fetch the latest `main` and create a new `feature/*` branch from `origin/main`.
- `main` is the integration branch. `develop` has been deleted and is no longer part of the workflow.
- Do not commit directly to `main`.
- Before committing, present the proposed commit boundaries and explain the intent of each commit.
- Stop before committing so the user can choose the granularity. Commit only after the user instructs you to proceed.
- When reporting commits, explain the intent and scope of each one.
- Merge and push only within the scope requested by the user.

# Errors and warnings

- Whenever an error or warning is detected, stop and consult the user regardless of whether it is pre-existing or new, its severity, its relation to the task, or the command's exit status.
- Report the source/location, message, known or uncertain impact, and proposed response. Obtain explicit approval to fix it or accept leaving it. Reporting alone is not approval.
- Before approval, do not independently fix, ignore, suppress, mark out of scope, or defer the finding. Necessary read-only investigation is allowed.
- Do not mark the task complete, commit, push, or create/update a PR while any error or warning lacks a user-approved disposition.
- After the approved action, rerun relevant checks and report the results, including remaining errors and warnings. Seek confirmation again for any new error or warning.

# Formatting

- Use the project's pinned Oxfmt version: `npm run format`.
- Run `npm run format:check` before handing off changes.
- Keep formatting-only changes separate from behavior changes.
- Preserve the vendored and generated files excluded in `.oxfmtrc.json`.
- Keep ESLint for linting; Oxfmt is responsible for formatting only.
