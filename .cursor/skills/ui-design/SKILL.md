---
name: ui-ux-designer
description: Self-improving skill for production-grade, responsive UI/UX (React/Tailwind/HTML). Prioritises mobile, scales to tablet and desktop. Evolves from feedback. Use when designing UI, improving layout, building components, running UX audits, or when the user mentions design, frontend, responsive, or accessibility.
---

# Responsive UI/UX Designer (2026 Best Practices)

Generates distinctive, production-grade UIs (React/Tailwind/HTML/CSS) and avoids generic AI aesthetics. Responsive-first: mobile priority, works at all viewport sizes.

## Self-Improvement Workflow (Do First)

1. **Load feedback**: Glob `.cursor/skills/ui-design/feedback/*.md` and extract rules (e.g. "spacing uneven → enforce variation").
2. **Load** `.cursor/skills/ui-design/anti-patterns.md` and `.cursor/skills/ui-design/design-system.md`. If the project has `docs/design-system.md`, use it as reference for tokens and tone.
3. **Update**: Append insights to anti-patterns.md (format: `- Ban: [issue] ([file])`) or to design-system.md (tokens, components).
4. **Archive**: Move feedback older than 14 days to `.cursor/skills/ui-design/feedback/archive/`.
5. **Log new**: If the user provides feedback (e.g. "buttons too small"), write `.cursor/skills/ui-design/feedback/[timestamp].md` with that feedback.

## Core Principles (2026 UX Trends)

- **Responsive-first**: Design for 320px mobile first, then tablet, then desktop. No awkward reflows.
- **Inclusive**: WCAG 2.2 AA+; 44px minimum touch targets; 4.5:1 contrast; full keyboard and screen reader support.
- **Cognitive ease**: Predictable patterns, low cognitive load, progressive disclosure, familiar terminology.
- **Human aesthetic**: Asymmetry where appropriate (e.g. 5–15% offsets), spatial depth (overlap, z-index), bold but restrained palettes.
- **Tone**: Pick one and stay consistent: minimal, organic, brutalist, playful. Match project docs (e.g. "warm, supportive") when present.

## Dynamic Rules

- **Anti-patterns** (see and update `.cursor/skills/ui-design/anti-patterns.md`): Avoid generic purple gradients, perfect symmetry, uniform spacing. Add new bans from feedback.
- **Design system** (see and update `.cursor/skills/ui-design/design-system.md`): Tokens (colours, spacing), component rules (e.g. button min-height 44px). Expand from feedback.

## Task Handling

| Task type | Actions |
|-----------|--------|
| **Audit** | Prioritised issues, impact, fixes; responsive and a11y notes. |
| **Design** | Wireframes (mobile then tablet/desktop) → code → component spec → checks. |
| **Refine** | Apply user feedback to existing code; update anti-patterns/design-system. |

## Output Templates

### UI Audit

```markdown
## Summary
[1–2 sentences]

## Top Issues (Prioritised)
- **Issue**: [description]
  - Impact: [why it matters]
  - Fix: [actionable step]

## Responsive Notes
## A11y Fixes
```

### New Design

```markdown
## Purpose & Audience
## Aesthetic Direction: [tone]

## Wireframes
Mobile (320px): [ASCII]
Tablet/Desktop: [ASCII]

## Code
[Full responsive component in tsx/html]

## Component Spec
- States: default, hover, focus, error
- Interactions: keyboard, touch
- Responsive: breakpoints used

## Checks
- [ ] Responsive at 320px and up
- [ ] Contrast (4.5:1+)
- [ ] Touch/keyboard
- [ ] Cognitive load low
- [ ] Anti-patterns avoided
- [ ] Feedback applied (if any)
- [ ] 2026 trends (e.g. personalisation hint where relevant)
```

## Examples

- **Input**: "UX audit dashboard.html" → Output: prioritised fixes list and improved code.
- **Input**: "Design a landing page for portfolio, creative tone" → Output: wireframes, code, spec, checks.
- **Input**: "Feedback: buttons too small" → Log to feedback; next design uses 44px+ min height.

## Attachment

- **Cursor**: Add `"${PROJECT_ROOT}/.cursor/skills/ui-design"` or the skill via Cursor rules so this skill activates on design tasks.
- **Trigger phrases**: "design a", "build ui", "improve layout", "make component", "ux audit", or mentions of UI, UX, layout, component, responsive, frontend, accessibility.
