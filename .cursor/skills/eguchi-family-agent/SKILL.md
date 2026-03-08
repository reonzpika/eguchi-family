---
name: work-to-completion
description: Instructs the agent to work autonomously until the stated goal is achieved, without stopping early. Use when the user wants the AI to continue without stopping until the goal is done, when working from an AGENTS.md or similar status doc, or when the user says to "keep going" or "don't stop until finished."
---

# Work to Completion

## Core principle

**Do not stop until the goal is achieved.** Work in repeated loops until success criteria are met. If tests fail or something is incomplete, fix it and continue. Only hand back with "here is what's left" if the user explicitly asks for a status update, or the goal is fully done.

## Phase 1: Plan first

Before implementing, create a **plan file** in **`.cursor/plans`**. Use a descriptive filename (e.g. `.cursor/plans/plan.md` or `.cursor/plans/feature-name.md`). Create the `.cursor/plans` directory if it does not exist. The plan must include:

- Goal and scope (from user request and/or AGENTS.md, README).
- Ordered steps to achieve the goal (understand, implement, test, install deps as needed).
- How you will verify success (e.g. Playwright tests, acceptance criteria).

**Then stop and hand the plan to the user.** The user executes (approves or runs the next phase). Do not start implementation until the user indicates they want execution (e.g. "go," "execute," "implement").

## Phase 2: Execute

After the user approves or asks to execute, run the development loop until the goal is met. Do not stop with unfinished work unless the user asks for status.

## Development loop

Repeat until the goal is met:

1. **Understand** – Read project docs (e.g. AGENTS.md, EPICS_AND_STORIES, USER_FLOWS, README) and relevant existing code.
2. **Implement** – Write clean, incremental code; one logical change at a time where possible.
3. **Dependencies** – Install any required dependencies to achieve the goal (e.g. `npm install`, `pip install`, adding packages to package.json or requirements.txt). Do this whenever new code or tests need a package.
4. **Test** – Use the **Playwright CLI**: run `npx playwright test`. Respect project config (e.g. `PLAYWRIGHT_BASE_URL` if dev runs on another port). Run the dev server manually first if the project expects it; then run Playwright. Fix failures and re-run.
5. **Self-improve** – If tests fail or the goal is not met: analyse the cause, update the code or approach (fix assertions, selectors, flows, or implementation), then retry. Do not report and stop; adjust and continue until tests pass and the goal is achieved.
6. **Reflect** – If the project keeps a status doc (e.g. AGENTS.md), update current status, learning log, or next-iteration plan. Update the plan in `.cursor/plans` if steps or scope changed.

## Using project context

- **Mission and scope:** Look for AGENTS.md, README, or docs at the repo root. Treat the "Mission" or "Current status" section as the goal and scope.
- **Implemented vs pending:** If the project tracks an "Implemented vs Pending" table or backlog, use it to choose the next work and update it when you complete items.
- **Success criteria:** If the project defines success criteria (e.g. in AGENTS.md), treat them as the definition of done. Keep going until each is satisfied.
- **High-level objective and philosophy:** For this repo, use AGENTS.md (Mission), docs/EPICS_AND_STORIES.md (goals and acceptance patterns), and docs/AI_SYSTEM_OVERVIEW.md (AI philosophy: warm, supportive family coach; hybrid Claude/OpenAI). Let these guide ambiguous or missing details.

## When you find gaps

If you discover a gap (missing spec, unclear requirement, conflict between plan and docs, or something the plan does not cover):

1. **Infer from objective and philosophy** – Re-read the Mission in AGENTS.md and the relevant philosophy (e.g. AI tone in AI_SYSTEM_OVERVIEW.md, epic goals in EPICS_AND_STORIES.md). Decide what behaviour or design best fits the high-level objective and the project’s stated philosophy.
2. **Act rather than only report** – Either implement in line with that understanding, or update the plan in `.cursor/plans` (and, if present, AGENTS.md or the relevant doc) so that the plan and docs are consistent. Do not stop at "there is a gap" unless you need user input (e.g. product decision that cannot be inferred).
3. **Document the inference** – When you fill a gap by inference, record it briefly (e.g. in the plan in `.cursor/plans`, a comment, or AGENTS.md Learning Log) so the next run or reviewer knows why a choice was made.

## Success criteria (default)

When the project does not define its own, aim for:

- Playwright tests pass (`npx playwright test`).
- Stated goal or acceptance criteria are met.
- No new regressions (e.g. console errors, broken flows).
- Required dependencies are installed and documented (package.json, requirements.txt, etc.).
- Changes are consistent with existing style and docs.

## Persistence rules

- **Plan then execute:** Always produce a plan file in `.cursor/plans` first; wait for user to approve or say "execute" before implementing.
- **Fix, don't report:** Encountering a failing test or broken step means fix it and re-run; do not stop and only summarise failures unless the user asked for a status report.
- **Self-improve:** When something fails, change the code or approach and retry; do not hand back with "tests still fail" without having tried to fix.
- **Install what's needed:** If the goal or tests require a dependency, install it (npm, pip, etc.); do not leave "install X" as a manual step for the user.
- **Next step always clear:** After each loop, either the goal is achieved or there is a concrete next action. Take that action in the same session when possible.
- **Update status when relevant:** If the project uses AGENTS.md or similar, update "Current status," "Implemented vs Pending," or "Next iteration" so the next run (or another agent) can continue without re-discovering everything.
- **Gaps: infer and act:** When specs or plans are missing or conflicting, use the high-level objective and philosophy to infer a consistent approach; then implement or update the plan and document the inference. Do not stop at reporting the gap unless a true product decision is required from the user.
