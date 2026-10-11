# Authority and scope

- The user is the final decision-maker for requirements, priorities, risk acceptance, and authorization of repository operations.
- Approval of a scoped task permits routine implementation decisions, non-destructive edits, and proportional verification needed to complete that task.
- Task approval does not authorize unrelated changes, new dependencies, material changes to agreed architecture or behavior, or changes to acceptance criteria.
- Distinguish approved requirements, implementation proposals, unresolved decisions, and verified facts.
- If instructions or prior decisions conflict, identify the conflict and request clarification before taking the affected action. Do not silently choose a new interpretation.
- A proposal, progress report, or technical recommendation is not authorization.

# Development workflow

- Before starting a new independent change set, inspect the current branch and working tree.
- For new work, fetch the latest `origin/main` and create a `feature/*` branch from it. For an already approved task in progress, continue on its existing feature branch unless instructed otherwise.
- If creating or switching branches would disturb existing work, request approval before proceeding. Never stash, reset, discard, or overwrite work merely to enable a branch operation.
- `main` is the integration branch. `develop` has been deleted and is no longer part of the workflow.
- Never commit directly to `main`.
- Preserve all existing uncommitted work, whether related or unrelated to the current task. Normal edits within the approved scope are permitted, but must not unintentionally destroy existing changes.
- Before committing, present the intended commit boundaries, scope, relevant verification results, and unresolved findings.
- Proactively propose commits at meaningful milestones. The entire feature does not need to be complete before proposing a commit.
- Stop before committing and obtain explicit approval. Never infer commit permission from approval to implement or test.
- An explicitly approved work-in-progress commit is permitted when incomplete checks and unresolved findings are disclosed. Such a commit does not mean the milestone is complete or ready for release.
- When reporting commits, explain their intent and scope.
- Push, merge, PR creation or modification, and deployment each require authorization for their respective scope.

# Goals and progress

- Before substantial work, establish the objective, expected deliverable, acceptance criteria, scope, and known constraints. Reuse requirements already established by the user instead of asking for them again.
- Routine technical decisions may be made within the approved scope. Material changes to requirements, user experience, dependencies, architecture, or acceptance criteria require approval.
- Prefer the smallest implementation that satisfies the agreed requirements.
- Prioritize completing the requested deliverable over speculative improvements, excessive investigation, or auxiliary tooling.
- Evaluate progress against the original objective throughout the task, not only when errors occur.
- Meaningful progress includes completed functionality, satisfied acceptance criteria, and evidence that materially resolves an approved technical decision.
- Test counts, elapsed time, diagnostic files, and logs are supporting evidence, not substitutes for deliverable progress.
- Report progress at meaningful milestones, blockers, and mandatory reassessment points.
- Clearly distinguish implemented, verified, partially verified, blocked, and unverified work.
- Never describe an incomplete deliverable as complete.

# Investigation and escalation

## Investigation boundaries

- A substantial investigation is focused work to establish feasibility, identify a root cause, or resolve a technical blocker beyond ordinary implementation and debugging.
- Before starting such an investigation, establish its question, required evidence, and stopping condition.
- Prefer existing tools, tests, and minimal reproductions.
- Before adding diagnostic infrastructure, consider whether the available evidence is already sufficient for the original decision.
- Do not expand an investigation simply because more technical details can be explored.
- Once its question is adequately answered, return to the requested deliverable or remaining acceptance work.
- Unresolved issues relevant to acceptance criteria must remain documented. Ending an investigation does not mean accepting or resolving those issues.

## Mandatory reassessment

Stop further related investigation and request a decision when either condition is reached:

- Two distinct attempts to resolve the same substantive blocker have failed to resolve it.
- A second correction to diagnostic scripts, test harnesses, logging, process management, or other auxiliary tooling becomes necessary within the same investigation.

Count attempts and auxiliary corrections cumulatively against the original investigation question, regardless of intermediate test successes, renamed subtasks, or approvals for individual corrections.

A correction is counted when it becomes necessary, not only after it has been completed.

When reliable elapsed-time measurement is available, also reassess after approximately 30 minutes without meaningful progress toward the investigation question or deliverable. Do not invent elapsed-time estimates.

Mandatory reassessment takes precedence over permission for further individual diagnostic corrections.

At reassessment, report:

1. The original question and acceptance criteria.
2. What the evidence has established.
3. What remains unresolved and its actual or potential impact.
4. What further investigation would accomplish and its expected complexity.
5. Available options: bounded continuation, explicit deferral, or a different approach.
6. The recommended option and why it serves the original goal.

Do not automatically recommend another diagnostic fix.

## Continuing after reassessment

- Further investigation requires explicit user approval of a bounded continuation, including its objective and next stopping condition.
- The continuation may authorize a defined number of additional attempts or a specific diagnostic task. Do not silently expand that authorization.
- Historical attempt counts remain recorded, but an approved continuation is not immediately blocked again merely because the original threshold was already reached.
- Stop again when the approved continuation limit is reached, a new substantive issue exceeds its scope, or its question has been answered.
- Approval for an individual fix does not, by itself, authorize indefinite continuation.
- A new investigation starts only when its original question is genuinely different, not merely renamed.

Deferring an issue requires explicit user approval and documentation of the affected scope, remaining risk, and conditions for reconsideration. Deferral is not resolution.

# Errors and warnings

## Decision order

For each detected error or warning:

1. Check whether mandatory investigation reassessment already requires stopping further related work.
2. If the finding is covered by a verifiable prior approval under unchanged conditions, retain its approved disposition and record it as needed.
3. If remediation of that specific issue is already authorized and remains within scope, perform the authorized action.
4. Otherwise, determine whether it qualifies for limited mechanical self-correction.
5. For every other finding, stop the affected work and request approval.

Findings involving uncertain impact, substantive regressions, failed required application checks, security, data integrity, dependencies, or unapproved configuration changes do not qualify as mechanical corrections.

When approval is required, report the source, message, known and uncertain impact, and recommended response.

Necessary read-only investigation is allowed to classify the finding. Reporting it is not authorization to fix, suppress, ignore, or defer it.

## Limited mechanical self-correction

One correction attempt is permitted for an unambiguous mechanical mistake within an already authorized operation:

- Shell syntax, quoting, or invocation mistakes, without changing the intended operation or its side effects.
- Incorrect file paths when the intended existing path has been verified.
- Formatting-only issues within the approved file scope.
- Truncated diagnostic output when the underlying information is preserved or can be safely reproduced without additional side effects.

Conditions:

- Do not change application behavior, dependencies, project configuration, test logic, diagnostic logic, assertions, expected values, or acceptance criteria.
- Do not modify files outside the approved scope or destroy existing work.
- Rerun the affected operation or check and confirm the outcome.
- If the intended check never ran, record it as not executed rather than failed.
- If the correction fails, the issue recurs, or its impact is uncertain, stop and request approval.
- Report trivial mistakes and corrections concisely at the next progress update. Do not create separate investigation archives for them.

Routine implementation of approved tests or diagnostics is allowed within its authorized scope. However, changing existing test semantics, diagnostic classifications, or observation coverage merely to obtain a passing result requires approval.

Mechanical and auxiliary corrections remain subject to mandatory investigation reassessment.

## Previously approved findings

- Previously approved findings may be retained without renewed approval only while their underlying issue, affected scope, and observed impact remain within the original approval.
- Superficial differences in message formatting alone do not necessarily create a new issue.
- Changes in cause, affected targets, versions, severity, or observed impact require reassessment.
- If the original approval cannot be established, request confirmation.
- Approved retention does not mean an issue is resolved or harmless.

## Unresolved findings and independent milestones

- Never discard or silently reclassify unresolved findings.
- Identify the milestones, shared code, and acceptance criteria each finding affects.
- Do not assume that a finding is unrelated merely because it was discovered during a different milestone.
- Independent work may proceed only when the separation is supported by evidence and any necessary deferral or continuation has been approved.
- An unresolved issue affecting a later milestone does not automatically prevent work on a demonstrably independent milestone.
- Do not claim a milestone complete or ready for release while its own acceptance criteria remain unmet.
- Work-in-progress commits may contain disclosed incomplete work only with explicit user authorization.
- Reconsider deferred findings before accepting or releasing the affected milestone.

## Prohibited responses

- Do not hide errors, suppress warnings, or disable lint rules merely to make checks pass.
- Do not weaken assertions, remove failing tests, or alter expected results to conceal failures.
- Do not silently substitute easier verification for required checks.
- Do not describe an unexplained failure as harmless.
- Do not retry failing operations indefinitely or without new evidence and a bounded purpose.
- Do not treat auxiliary test success as proof that application behavior is correct.

# Verification

- Verify against the agreed acceptance criteria and relevant technical risks.
- Use the existing test suite and infrastructure whenever practical.
- Verify actual application behavior when required; diagnostic and unit tests do not replace user-facing acceptance checks.
- Distinguish application failures, test-harness failures, and commands that never executed their intended tests.
- Preserve meaningful failed results separately from subsequent successes.
- Do not report unexecuted verification as successful.
- Keep verification proportional to the task. Avoid unnecessary diagnostic frameworks, repeated unaffected builds, and excessive logging.
- Rerun checks affected by changes; do not repeatedly rerun unrelated successful checks without a concrete reason.
- Record verification conditions when they materially affect comparison results.
- Report incomplete verification and its impact rather than silently reducing acceptance criteria.

# Formatting

- Use the project's pinned Oxfmt version. The existing project command is `npm run format`.
- Before running a formatter that writes files, inspect its scope. If the project-wide command would affect unrelated files, use the same pinned formatter on approved files only.
- Do not format, revert, or otherwise modify unrelated changes to obtain a clean result.
- Run `npm run format:check` before presenting a change as ready for handoff. A blocker report does not require repeating an unchanged successful check.
- If the formatting check finds unrelated pre-existing issues, report them instead of modifying out-of-scope files.
- Keep unrelated formatting-only changes separate from behavioral changes. Formatting necessary for the edited code may remain in the same change.
- Preserve vendored and generated files excluded by `.oxfmtrc.json`.
- Use ESLint for linting and Oxfmt for formatting.

# Reporting and handoff

Keep reports concise, factual, and focused on decisions.

At milestones or escalation points, include:

1. What deliverable or acceptance criterion has actually been completed.
2. What remains incomplete or unverified.
3. What is blocking progress and which requirements it affects.
4. Whether the current work still serves the original objective.
5. The recommended next action and any approval required.
6. Proposed commit boundaries when a meaningful change set is ready.

Do not create extensive investigation records for trivial operational mistakes.

When progress becomes dominated by auxiliary problems, raise the issue before continuing to add diagnostic work.

The user should not have to discover that the task has stopped producing meaningful progress.
