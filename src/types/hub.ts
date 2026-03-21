/** JSON stored in family_tools.profile_json after AI enrich + edits */
export interface HubToolProfile {
  summary: string;
  good_for: string[];
  bad_for: string[];
  cautions: string[];
  extra_sections?: { title: string; body: string }[];
}

/** Draft mission suggested on tool create (family_tools.mission_draft_json) */
export interface HubMissionDraft {
  title: string;
  estimated_minutes: number | null;
  steps: string[];
  prompt_blocks: { label: string; text: string }[];
  done_criteria: string[];
}

export interface FamilyToolRow {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  status: "draft" | "published";
  profile_json: HubToolProfile;
  mission_draft_json: HubMissionDraft | null;
  sort_order: number;
  featured_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyToolMissionRow {
  id: string;
  tool_id: string;
  title: string;
  estimated_minutes: number | null;
  steps: unknown;
  prompt_blocks: unknown;
  done_criteria: unknown;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyToolThreadRow {
  id: string;
  tool_id: string | null;
  kind: "qa" | "general";
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyToolPostRow {
  id: string;
  thread_id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  deleted_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
}
