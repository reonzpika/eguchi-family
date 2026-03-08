# Family Workspace - Database Schema

**Database:** Supabase (PostgreSQL)  
**Version:** 1.0  
**Migration Date:** March 2026

---

## Overview

This schema supports:
- User profiles from discovery assessment
- Ideas and project lifecycle
- Milestones and tasks
- Weekly reflections
- Activity feed
- Comments and reactions
- Notifications and push subscriptions

---

## Database Migration (SQL)

### Step 1: Enable Extensions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';
```

### Step 2: Create Enum Types

```sql
-- Milestone status lifecycle
CREATE TYPE milestone_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Business framework types
CREATE TYPE framework_type AS ENUM (
  'service_blueprint',
  'lean_canvas',
  'value_proposition',
  'two_sided_market',
  'creator_business'
);

-- Project lifecycle stages
CREATE TYPE project_stage AS ENUM (
  'planning',
  'active',
  'growing',
  'paused',
  'archived'
);

-- Activity feed types
CREATE TYPE activity_type AS ENUM (
  'idea_started',
  'project_created',
  'milestone_completed',
  'reflection_submitted',
  'comment_added'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'milestone_celebration',
  'weekly_reflection',
  'comment_on_project',
  'comment_mention',
  'family_milestone',
  'inactive_nudge'
);

-- Notification priority
CREATE TYPE notification_priority AS ENUM (
  'high',
  'medium',
  'low'
);
```

### Step 3: Create Tables

```sql
-- =============================================
-- USER PROFILES (Discovery Phase)
-- =============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Discovery assessment data
  strengths TEXT[],                    -- Natural talents
  interests TEXT[],                    -- Free time activities
  time_availability TEXT,              -- "2-5h", "5-10h", "10+h"
  daily_frustrations TEXT[],           -- Problems they notice
  learning_preference TEXT,            -- "visual", "reading", "hands-on", "talking"
  success_drivers TEXT[],              -- What motivates them
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  
  -- AI-generated profile
  superpower_title TEXT,               -- "創造的な問題解決者"
  superpower_description TEXT,
  conversation_insights JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  assessment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- IDEAS (Validation Phase)
-- =============================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Idea basics
  title TEXT NOT NULL,
  description TEXT,
  
  -- AI chat conversation
  chat_messages JSONB DEFAULT '[]'::jsonb,  -- Full conversation history
  
  -- Validation summary (AI-generated)
  validation_summary JSONB,            -- Business summary data
  framework_used framework_type,       -- Which framework was applied
  
  -- Status
  is_promoted_to_project BOOLEAN DEFAULT FALSE,
  promoted_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS (Execution Phase)
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  
  -- Project basics
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📁',
  
  -- Framework and strategy
  framework_type framework_type NOT NULL,
  living_document JSONB NOT NULL,      -- Dynamic strategy document
  
  -- Status and progress
  stage project_stage DEFAULT 'planning',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  
  -- Activity tracking
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  inactive_nudge_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MILESTONES (Execution Phase)
-- =============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Milestone details
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,     -- 1, 2, 3...
  
  -- Status
  status milestone_status DEFAULT 'not_started',
  
  -- Dates
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id, sequence_order)
);

-- =============================================
-- TASKS (Execution Phase)
-- =============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(milestone_id, sequence_order)
);

-- =============================================
-- REFLECTIONS (Execution Phase)
-- =============================================
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Reflection responses
  what_worked TEXT,                    -- "What did you work on?"
  wins TEXT,                           -- "Any wins?"
  blockers TEXT,                       -- "What's blocking you?"
  
  -- AI-generated insight
  ai_insight TEXT,
  
  -- Updates made
  living_doc_updated BOOLEAN DEFAULT FALSE,
  new_milestones_generated BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  week_of DATE NOT NULL,               -- Week this reflection covers
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACTIVITY FEED (Collaboration Phase)
-- =============================================
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity type
  activity_type activity_type NOT NULL,
  
  -- Related entities
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  
  -- Display data
  title TEXT NOT NULL,                 -- "Milestone 1を完了しました！"
  emoji TEXT,
  metadata JSONB,                      -- Additional context
  
  -- Privacy (ideas are private)
  is_private BOOLEAN DEFAULT FALSE,    -- True for "started exploring idea"
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMENTS (Collaboration Phase)
-- =============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comment location
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  activity_feed_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  living_doc_section TEXT,             -- "## Vision", "## Target Customer", etc.
  
  -- Threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  thread_depth INTEGER DEFAULT 0,      -- Max 3 levels
  
  -- Content
  content TEXT NOT NULL,
  mentions TEXT[],                     -- User IDs mentioned with @
  
  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  
  -- Edit tracking
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (thread_depth <= 3),
  CHECK (
    -- Must be attached to something
    (project_id IS NOT NULL) OR 
    (milestone_id IS NOT NULL) OR 
    (activity_feed_id IS NOT NULL) OR
    (living_doc_section IS NOT NULL AND project_id IS NOT NULL)
  )
);

-- =============================================
-- REACTIONS (Collaboration Phase)
-- =============================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Reaction type
  emoji TEXT NOT NULL,                 -- '👍', '❤️', '🎉', '💡', '🤔'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, comment_id, emoji),
  CHECK (emoji IN ('👍', '❤️', '🎉', '💡', '🤔'))
);

-- =============================================
-- NOTIFICATIONS (Execution/Collaboration Phase)
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'medium',
  
  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,                     -- Deep link to relevant screen
  
  -- Related entities
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_pushed BOOLEAN DEFAULT FALSE,     -- Sent via push notification
  pushed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PUSH SUBSCRIPTIONS (Execution Phase)
-- =============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, endpoint)
);
```

### Step 4: Create Indexes

```sql
-- User profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Ideas
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_promoted ON ideas(is_promoted_to_project) WHERE is_promoted_to_project = TRUE;

-- Projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_projects_last_activity ON projects(last_activity_at DESC);
CREATE INDEX idx_projects_active ON projects(user_id, stage) WHERE stage IN ('active', 'growing');

-- Milestones
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_project_order ON milestones(project_id, sequence_order);

-- Tasks
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_tasks_milestone_order ON tasks(milestone_id, sequence_order);
CREATE INDEX idx_tasks_incomplete ON tasks(milestone_id) WHERE is_completed = FALSE;

-- Reflections
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_project_id ON reflections(project_id);
CREATE INDEX idx_reflections_week ON reflections(week_of DESC);

-- Activity feed
CREATE INDEX idx_activity_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_public ON activity_feed(created_at DESC) WHERE is_private = FALSE;

-- Comments
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_milestone_id ON comments(milestone_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_not_deleted ON comments(project_id, created_at DESC) WHERE is_deleted = FALSE;

-- Reactions
CREATE INDEX idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(user_id, type);

-- Push subscriptions
CREATE INDEX idx_push_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_active ON push_subscriptions(user_id) WHERE is_active = TRUE;
```

### Step 5: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- USER PROFILES: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- IDEAS: Users can only access their own ideas
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid()::text = user_id);

-- PROJECTS: All family members can view, only owner can modify
CREATE POLICY "All users can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id);

-- MILESTONES: Same as projects (view all, modify own)
CREATE POLICY "All users can view milestones" ON milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = milestones.project_id)
  );

CREATE POLICY "Users can manage own milestones" ON milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.project_id 
      AND projects.user_id = auth.uid()::text
    )
  );

-- TASKS: Same as milestones
CREATE POLICY "All users can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = tasks.milestone_id
    )
  );

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM milestones 
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = tasks.milestone_id
      AND projects.user_id = auth.uid()::text
    )
  );

-- REFLECTIONS: Users can only access their own
CREATE POLICY "Users can view own reflections" ON reflections
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own reflections" ON reflections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- ACTIVITY FEED: All users can view public activities
CREATE POLICY "All users can view public feed" ON activity_feed
  FOR SELECT USING (
    is_private = FALSE OR auth.uid()::text = user_id
  );

CREATE POLICY "Users can create own activities" ON activity_feed
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- COMMENTS: All family members can view and create
CREATE POLICY "All users can view comments" ON comments
  FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "All users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can soft-delete own comments" ON comments
  FOR UPDATE USING (auth.uid()::text = user_id);

-- REACTIONS: All users can view and manage own
CREATE POLICY "All users can view reactions" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reactions" ON reactions
  FOR ALL USING (auth.uid()::text = user_id);

-- NOTIFICATIONS: Users can only access their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- PUSH SUBSCRIPTIONS: Users can only manage their own
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid()::text = user_id);
```

### Step 6: Create Update Triggers

```sql
-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## TypeScript Types

```typescript
// =============================================
// ENUMS
// =============================================

export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum FrameworkType {
  SERVICE_BLUEPRINT = 'service_blueprint',
  LEAN_CANVAS = 'lean_canvas',
  VALUE_PROPOSITION = 'value_proposition',
  TWO_SIDED_MARKET = 'two_sided_market',
  CREATOR_BUSINESS = 'creator_business'
}

export enum ProjectStage {
  PLANNING = 'planning',
  ACTIVE = 'active',
  GROWING = 'growing',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export enum ActivityType {
  IDEA_STARTED = 'idea_started',
  PROJECT_CREATED = 'project_created',
  MILESTONE_COMPLETED = 'milestone_completed',
  REFLECTION_SUBMITTED = 'reflection_submitted',
  COMMENT_ADDED = 'comment_added'
}

export enum NotificationType {
  MILESTONE_CELEBRATION = 'milestone_celebration',
  WEEKLY_REFLECTION = 'weekly_reflection',
  COMMENT_ON_PROJECT = 'comment_on_project',
  COMMENT_MENTION = 'comment_mention',
  FAMILY_MILESTONE = 'family_milestone',
  INACTIVE_NUDGE = 'inactive_nudge'
}

export enum NotificationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// =============================================
// TABLE TYPES
// =============================================

export interface UserProfile {
  id: string;
  user_id: string;
  strengths: string[];
  interests: string[];
  time_availability: string;
  daily_frustrations: string[];
  learning_preference: string;
  success_drivers: string[];
  confidence_level: number;
  superpower_title: string | null;
  superpower_description: string | null;
  conversation_insights: any[];
  assessment_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  chat_messages: ChatMessage[];
  validation_summary: ValidationSummary | null;
  framework_used: FrameworkType | null;
  is_promoted_to_project: boolean;
  promoted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  idea_id: string | null;
  title: string;
  description: string | null;
  emoji: string;
  framework_type: FrameworkType;
  living_document: LivingDocument;
  stage: ProjectStage;
  progress_percentage: number;
  last_activity_at: string;
  inactive_nudge_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  status: MilestoneStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  project_id: string;
  what_worked: string | null;
  wins: string | null;
  blockers: string | null;
  ai_insight: string | null;
  living_doc_updated: boolean;
  new_milestones_generated: boolean;
  week_of: string;
  submitted_at: string;
  created_at: string;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  idea_id: string | null;
  project_id: string | null;
  milestone_id: string | null;
  title: string;
  emoji: string | null;
  metadata: any;
  is_private: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  project_id: string | null;
  milestone_id: string | null;
  activity_feed_id: string | null;
  living_doc_section: string | null;
  parent_comment_id: string | null;
  thread_depth: number;
  content: string;
  mentions: string[];
  is_deleted: boolean;
  deleted_at: string | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  comment_id: string;
  emoji: '👍' | '❤️' | '🎉' | '💡' | '🤔';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_url: string | null;
  project_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  read_at: string | null;
  is_pushed: boolean;
  pushed_at: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// SUPPORTING TYPES
// =============================================

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  options?: string[];
}

export interface ValidationSummary {
  idea: string;
  target_customer: string;
  problem: string;
  solution: string;
  differentiation: string;
  pricing: string;
  reality_checks: string[];
  next_step: string;
}

export interface LivingDocument {
  vision: string;
  target_customer: string;
  problem: string;
  solution: string;
  revenue_model: string;
  key_metrics?: string;
  differentiation?: string;
  risks?: string[];
  next_steps?: string[];
  last_updated: string;
}
```

---

## Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Migration Checklist

Before running migrations:

- [ ] Backup existing database
- [ ] Review all RLS policies
- [ ] Test enum values match application logic
- [ ] Verify foreign key relationships
- [ ] Check index coverage for common queries
- [ ] Test RLS policies with multiple users
- [ ] Verify trigger functions work correctly

---

**Run migrations in order: Extensions → Enums → Tables → Indexes → RLS → Triggers**
