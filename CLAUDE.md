# Reed

Read-later app (iOS, Android, Web). Product intent: `docs/specs/init_app/intent.md`. PRDs: `tasks/prd-*.md`.

## GitHub issues are the source of truth for work

Repo: `yannibenoit/reed`. Use the `gh` CLI.

### Always create an issue
- **Every user story** in a PRD gets one issue, created when the story is written.
  - Title: `US-XXX: <story title>`
  - Body: the story's description + acceptance criteria (as `- [ ]` checkboxes) + a footer `Source: tasks/prd-<name>.md (US-XXX) · Release: <release>`
  - Labels: `user-story`, the release (`v1.0`, `v1.0.x`, …), one `area:<area>` label
  - Milestone: the release
  - Then add the link to the story heading in the PRD: `#### US-XXX: Title ([#N](https://github.com/yannibenoit/reed/issues/N))`
- **Every task** (technical work, bug, chore, spike not covered by a single story) gets an issue before work starts.
  - Title: short imperative sentence
  - Labels: `task` (or `bug`), release and `area:` labels when they apply
  - If it belongs to a story, link it: write `Part of #N` in the body, and add the task as a sub-issue / checklist item on the story issue.
- Search first (`gh issue list --search "<keywords>" --state all`) to avoid duplicates.

### Always update issues when things change
- **Story or scope changes** (PRD edited, acceptance criteria added/removed, release moved): update the issue body/labels/milestone in the same session, and add a short comment saying what changed and why.
- **Progress:** tick acceptance criteria checkboxes as they're met; comment on decisions and blockers.
- **Branches/PRs:** reference the issue in the branch name (`us-017-today-queue`) and PR body (`Closes #17`).
- **Done:** close the issue only when all acceptance criteria are met (the PR's `Closes #N` does this).
- **Dropped:** close as "not planned" with a comment explaining why; don't delete.
- Keep the PRD and the issue in sync: if one changes, change the other.

### Labels
`user-story`, `task`, `bug`, `v1.0`, `v1.0.x`, `area:foundation`, `area:capture-import`, `area:tags`, `area:homepage`, `area:reader`, `area:highlights`, `area:picker`, `area:analytics`, `area:goal`, `area:design`, `area:ai`, `area:summary`, `area:tts`, `area:resurfacing`. Create a new `area:` label if needed (`gh label create`).
