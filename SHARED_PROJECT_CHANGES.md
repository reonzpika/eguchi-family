# Shared Project Implementation - All Changes

## Migration (run manually)

**File:** `supabase/migrations/20250315000000_add_shared_with_all.sql`

```sql
-- Shared project: projects editable by all family members.
-- shared_with_all = true: any authenticated user can edit (API enforces; app uses admin client).
-- RLS kept minimal since API routes use service role.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'shared_with_all'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN shared_with_all BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_shared_with_all ON public.projects(shared_with_all) WHERE shared_with_all = TRUE;
```

---

## New Files

### 1. `src/lib/project-permissions.ts`

```typescript
export interface ProjectWithOwner {
  user_id: string;
  shared_with_all?: boolean;
}

export function canEditProject(
  project: ProjectWithOwner,
  userId: string
): boolean {
  if (!userId) return false;
  if (project.shared_with_all) return true;
  return project.user_id === userId;
}
```

### 2. `src/app/api/admin/projects/create-shared/route.ts`

Admin-only POST endpoint that creates the shared "Family Workspace アプリ改善" project with living document and 5 milestones. See full file in repo.

### 3. `src/components/admin/CreateSharedProjectButton.tsx`

Client component for admin dashboard: shows "Create" button or link to projects if shared project exists. See full file in repo.

---

## Modified Files

### AGENTS.md
- Added line: `- **Complete:** Shared project (shared_with_all): admin creates "Family Workspace アプリ改善" project; all members can edit; activity shows "家族"; Friday reminder skipped.`

### src/app/(app)/projects/[id]/page.tsx
- Added `shared_with_all?: boolean` to Project interface
- `setIsOwner(projectData.user_id === userId || !!projectData.shared_with_all)`
- `ownerName = project.shared_with_all ? "家族" : (project.users?.name || "不明")`

### src/app/(app)/projects/page.tsx
- Added `shared_with_all?: boolean` to Project interface
- `ownerName = project.shared_with_all ? "家族" : (project.users?.name || "不明")`
- `ownerColor = project.shared_with_all ? "#7CC9A0" : (project.users?.avatar_color || "#F97B6B")`

### src/app/admin/page.tsx
- Import `CreateSharedProjectButton`
- Added query for shared project: `supabase.from("projects").select("id").eq("shared_with_all", true).limit(1).maybeSingle()`
- Added `<CreateSharedProjectButton hasSharedProject={!!sharedProject.data?.id} />`

### src/app/api/activity-feed/route.ts
- Fetch `projectIds` from activities
- Query projects where `shared_with_all = true`
- For activities on shared projects, set `user.name = "家族"`

### src/app/api/cron/friday-reminder/route.ts
- Select `shared_with_all` in projects query
- Filter out shared projects: `.filter((p) => !p.shared_with_all)` before mapping to userIds

### src/app/api/milestones/[id]/complete/route.ts
- Import `canEditProject`
- Select `shared_with_all` from project
- Replace `project.user_id !== session.user.id` with `!canEditProject(project, session.user.id)`

### src/app/api/milestones/[id]/start/route.ts
- Same pattern as complete

### src/app/api/milestones/generate/route.ts
- Same pattern

### src/app/api/projects/[id]/activity/route.ts
- Select `shared_with_all` from project
- For shared projects, use `displayNameForShared = "家族"` for all activities

### src/app/api/projects/[id]/milestones/route.ts
- Same canEditProject pattern

### src/app/api/projects/[id]/route.ts
- Same canEditProject pattern

### src/app/api/projects/[id]/update/route.ts
- Switched from `createServerComponentClient` to `createAdminClient`
- Same canEditProject pattern

### src/app/api/reflections/route.ts
- Same canEditProject pattern

### src/app/api/tasks/[id]/route.ts
- Same canEditProject pattern

### src/components/ui/Avatar.tsx
- Added `家族: "#7CC9A0"` to memberColors

---

## Summary

| Type | Count |
|------|-------|
| New files | 4 |
| Modified files | 16 |
| API routes updated | 9 |
