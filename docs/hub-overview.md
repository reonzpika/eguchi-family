# Family AI Hub (Digital Engawa)

## Purpose

Private family PWA area for **action-oriented** AI tool literacy: curated tool pages, missions with prompts and “done” checks, Q&A threads, and a plaza for general topics. Output quality is framed as skill + verification, not which brand you open.

## Routes (app)

| Path | Role |
|------|------|
| `/` | Hub home: featured mission, new tools carousel, tips, link to timeline and plaza |
| `/tools` | Published tools list; add tool |
| `/tools/new` | Create draft tool (optional AI enrich) |
| `/tools/[id]` | Tool profile, missions, link to threads |
| `/tools/[id]/missions/[missionId]` | Mission steps, prompts, completion checklist |
| `/tools/[id]/threads` | Threads for that tool |
| `/tools/[id]/threads/[threadId]` | Thread + replies |
| `/discussions` | Plaza (tool_id null) |
| `/discussions/[threadId]` | Plaza thread |
| `/feed` | Former home: family activity timeline |
| `/admin/hub` | Admin-only mission composer |

## Database (Supabase)

- `family_tools` — `status` draft \| published, `profile_json`, `mission_draft_json`, `user_id`
- `family_tool_missions` — linked to tool; `published`, JSON steps / prompt_blocks / done_criteria
- `family_tool_threads` — `tool_id` nullable (plaza when null); `kind` qa \| general
- `family_tool_posts` — thread replies; soft-delete via `deleted_at`

Notification enum values: `hub_new_tool`, `hub_new_mission`, `hub_thread_reply`.

## APIs

Under `/api/hub/`: tools CRUD, `publish`, `enrich` (AI), missions (admin POST), threads, posts, `featured` for home hero.

## Design

Tokens and copy tone: [docs/stitch/kazoku_harmony/DESIGN.md](../stitch/kazoku_harmony/DESIGN.md).
