# Family Workspace - API Specification

**API Version:** 1.0  
**Base URL:** `/api`  
**Authentication:** NextAuth.js session-based

---

## Authentication

All API routes require authentication unless marked `[PUBLIC]`.

### Session Check
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Proceed with authenticated logic
}
```

---

## Error Response Format

All errors follow this structure:

```typescript
interface APIError {
  error: string;          // Error message
  code?: string;          // Error code (optional)
  details?: any;          // Additional context (optional)
}

// Example error responses
{
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}

{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "title",
    "message": "Title is required"
  }
}
```

---

## Discovery Phase

### POST `/api/discovery/assessment`

Submit discovery assessment responses.

**Request Body:**
```typescript
{
  strengths: string[];
  interests: string[];
  time_availability: string;
  daily_frustrations: string[];
  learning_preference: string;
  success_drivers: string[];
  confidence_level: number; // 1-5
}
```

**Response:**
```typescript
{
  profile: UserProfile;
  superpower: {
    title: string;
    description: string;
  };
  suggested_ideas: Array<{
    title: string;
    emoji: string;
    description: string;
  }>;
}
```

**AI Integration:**
- Uses Claude (Anthropic) to generate superpower and ideas
- Prompt: See `/lib/ai/prompts/discovery.ts`

---

## Validation Phase (Ideas)

### POST `/api/ideas`

Create a new idea.

**Request Body:**
```typescript
{
  title: string;
  description?: string;
}
```

**Response:**
```typescript
{
  idea: Idea;
}
```

### GET `/api/ideas`

Get all user's ideas.

**Response:**
```typescript
{
  ideas: Idea[];
}
```

### GET `/api/ideas/[id]`

Get single idea with full chat history.

**Response:**
```typescript
{
  idea: Idea;
  chat_messages: ChatMessage[];
}
```

### POST `/api/ideas/[id]/chat`

Send message in idea chat (AI conversation).

**Request Body:**
```typescript
{
  message: string;
}
```

**Response:**
```typescript
{
  user_message: ChatMessage;
  ai_response: ChatMessage;
  updated_idea: Idea;
}
```

**AI Integration:**
- Uses Claude for conversational validation
- Maintains full chat history in `idea.chat_messages`
- Prompt: See `/lib/ai/prompts/validation.ts`

### POST `/api/ideas/[id]/complete`

Complete validation and generate business summary.

**Response:**
```typescript
{
  validation_summary: ValidationSummary;
  framework_used: FrameworkType;
  updated_idea: Idea;
}
```

**AI Integration:**
- Uses OpenAI for structured JSON output
- Determines appropriate framework type
- Generates summary with reality checks

### POST `/api/ideas/[id]/promote`

Promote idea to project.

**Request Body:**
```typescript
{
  // Optional customization
  framework_type?: FrameworkType;
}
```

**Response:**
```typescript
{
  project: Project;
  initial_milestones: Milestone[];
}
```

**AI Integration:**
- Uses OpenAI to generate initial 3 milestones
- Creates living document from validation summary
- Calibrates milestone difficulty based on user profile

---

## Execution Phase (Projects)

### GET `/api/projects`

Get all user's projects.

**Query Parameters:**
- `stage?: ProjectStage` - Filter by stage
- `include_archived?: boolean` - Include archived projects

**Response:**
```typescript
{
  projects: Project[];
}
```

### GET `/api/projects/[id]`

Get single project with full details.

**Response:**
```typescript
{
  project: Project;
  milestones: Milestone[];
  current_milestone: Milestone | null;
  progress: {
    completed_milestones: number;
    total_milestones: number;
    current_milestone_progress: number;
    overall_percentage: number;
  };
}
```

### PATCH `/api/projects/[id]`

Update project details.

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  emoji?: string;
  stage?: ProjectStage;
  living_document?: LivingDocument;
}
```

**Response:**
```typescript
{
  project: Project;
}
```

### GET `/api/projects/[id]/milestones`

Get all milestones for a project.

**Response:**
```typescript
{
  milestones: Array<Milestone & {
    tasks: Task[];
    completion_percentage: number;
  }>;
}
```

### POST `/api/milestones/[id]/start`

Start a milestone (changes status to in_progress).

**Response:**
```typescript
{
  milestone: Milestone;
  project: Project; // Updated last_activity_at
}
```

### POST `/api/milestones/[id]/complete`

Mark milestone as completed.

**Response:**
```typescript
{
  milestone: Milestone;
  project: Project;      // Updated progress
  next_milestone: Milestone | null;
  celebration: {
    message: string;
    confetti: boolean;
  };
}
```

**Side Effects:**
- Creates activity feed item
- Sends notification to project owner
- Updates project progress percentage
- Checks if all milestones complete → prompt for new milestones

### POST `/api/milestones/generate`

Generate next set of milestones for a project.

**Request Body:**
```typescript
{
  project_id: string;
  direction?: 'keep_growing' | 'maintain' | 'pivot';
  context?: string; // User feedback about direction
}
```

**Response:**
```typescript
{
  milestones: Milestone[];
  updated_living_doc: LivingDocument;
}
```

**AI Integration:**
- Uses OpenAI for structured milestone generation
- Considers current project progress
- Adjusts difficulty based on success rate

### PATCH `/api/tasks/[id]`

Toggle task completion.

**Request Body:**
```typescript
{
  is_completed: boolean;
}
```

**Response:**
```typescript
{
  task: Task;
  milestone: Milestone; // Updated completion count
  project: Project;     // Updated last_activity_at
}
```

---

## Reflection System

### POST `/api/reflections`

Submit weekly reflection.

**Request Body:**
```typescript
{
  project_id: string;
  what_worked: string;
  wins: string;
  blockers: string;
}
```

**Response:**
```typescript
{
  reflection: Reflection;
  ai_insight: string;
  living_doc_updated: boolean;
  new_milestones_generated: boolean;
}
```

**AI Integration:**
- Uses Claude to generate insight
- Optionally updates living document
- May generate new milestones if stuck

### GET `/api/reflections`

Get user's reflections.

**Query Parameters:**
- `project_id?: string` - Filter by project
- `weeks?: number` - Limit to recent N weeks

**Response:**
```typescript
{
  reflections: Reflection[];
}
```

---

## Activity Feed

### GET `/api/activity-feed`

Get activity feed for all family members.

**Query Parameters:**
- `limit?: number` - Default 20, max 50
- `before?: string` - ISO timestamp for pagination

**Response:**
```typescript
{
  activities: Array<ActivityFeed & {
    user: {
      id: string;
      name: string;
    };
  }>;
  has_more: boolean;
}
```

**Privacy Rules:**
- Ideas show generic activity ("started exploring idea")
- Projects show full details
- Only public activities visible to other users

### POST `/api/activity-feed`

Create activity feed item (internal use).

**Request Body:**
```typescript
{
  activity_type: ActivityType;
  title: string;
  emoji?: string;
  project_id?: string;
  milestone_id?: string;
  is_private?: boolean;
  metadata?: any;
}
```

**Response:**
```typescript
{
  activity: ActivityFeed;
}
```

---

## Collaboration (Comments)

### GET `/api/comments`

Get comments for a specific target.

**Query Parameters (one required):**
- `project_id?: string`
- `milestone_id?: string`
- `activity_feed_id?: string`
- `living_doc_section?: string` (requires project_id)

**Response:**
```typescript
{
  comments: Array<Comment & {
    user: {
      id: string;
      name: string;
    };
    replies: Comment[];
    reaction_counts: {
      [emoji: string]: number;
    };
    user_reaction: string | null;
  }>;
}
```

### POST `/api/comments`

Create a new comment.

**Request Body:**
```typescript
{
  content: string;
  project_id?: string;
  milestone_id?: string;
  activity_feed_id?: string;
  living_doc_section?: string;
  parent_comment_id?: string; // For threading
}
```

**Response:**
```typescript
{
  comment: Comment;
}
```

**Side Effects:**
- Creates notifications for:
  - Project owner (if not commenter)
  - Mentioned users (@mentions)
  - Thread participants (if reply)
- Extracts @mentions from content

### PATCH `/api/comments/[id]`

Edit comment (within 24 hours only).

**Request Body:**
```typescript
{
  content: string;
}
```

**Response:**
```typescript
{
  comment: Comment;
}
```

### DELETE `/api/comments/[id]`

Soft-delete comment.

**Response:**
```typescript
{
  comment: Comment; // is_deleted = true
}
```

### POST `/api/comments/[id]/reactions`

Add reaction to comment.

**Request Body:**
```typescript
{
  emoji: '👍' | '❤️' | '🎉' | '💡' | '🤔';
}
```

**Response:**
```typescript
{
  reaction: Reaction;
}
```

### DELETE `/api/comments/[id]/reactions/[emoji]`

Remove reaction from comment.

**Response:**
```typescript
{
  success: boolean;
}
```

---

## Notifications

### GET `/api/notifications`

Get user's notifications.

**Query Parameters:**
- `unread_only?: boolean`
- `limit?: number` - Default 20

**Response:**
```typescript
{
  notifications: Notification[];
  unread_count: number;
}
```

### PATCH `/api/notifications/[id]/read`

Mark notification as read.

**Response:**
```typescript
{
  notification: Notification;
}
```

### POST `/api/notifications/mark-all-read`

Mark all user notifications as read.

**Response:**
```typescript
{
  count: number; // Number marked as read
}
```

### POST `/api/notifications/send` **[INTERNAL]**

Send notification (called by other API routes).

**Request Body:**
```typescript
{
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  project_id?: string;
  comment_id?: string;
  priority?: NotificationPriority;
  send_push?: boolean;
}
```

**Response:**
```typescript
{
  notification: Notification;
  push_sent: boolean;
}
```

---

## Push Notifications

### POST `/api/push/subscribe`

Subscribe to push notifications.

**Request Body:**
```typescript
{
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}
```

**Response:**
```typescript
{
  subscription: PushSubscription;
}
```

### POST `/api/push/unsubscribe`

Unsubscribe from push notifications.

**Request Body:**
```typescript
{
  endpoint: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

### POST `/api/push/send` **[INTERNAL]**

Send push notification (server-side only).

**Request Body:**
```typescript
{
  user_id: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}
```

**Uses:** web-push library with VAPID keys

---

## Supabase Realtime

### Realtime Subscriptions

Subscribe to live updates using Supabase Realtime:

```typescript
// Activity feed updates
supabase
  .channel('activity-feed')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_feed',
      filter: 'is_private=eq.false'
    },
    (payload) => {
      // New activity added
    }
  )
  .subscribe();

// Comments on a project
supabase
  .channel(`project-comments-${projectId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'comments',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // Comment added/updated/deleted
    }
  )
  .subscribe();
```

---

## Rate Limiting

Implement rate limiting for:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const rateLimits = {
  // AI endpoints - expensive
  aiChat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 per hour
  }),
  
  // Comment creation - prevent spam
  comments: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '5 m'), // 30 per 5 min
  }),
  
  // General API - generous
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 per min
  }),
};

// Usage in route
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const { success } = await rateLimits.aiChat.limit(session.user.id);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Continue...
}
```

---

## AI Integration Points

### Claude (Anthropic) - Conversational

**Used for:**
- Discovery assessment superpower generation
- Idea validation conversations
- Weekly reflection insights
- Living document updates

**Configuration:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Example usage
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ]
});
```

### OpenAI - Structured Output

**Used for:**
- Business summary generation (JSON)
- Milestone generation (JSON array)
- Framework selection

**Configuration:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Example with structured output
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  response_format: { type: 'json_object' }
});

const result = JSON.parse(response.choices[0].message.content);
```

---

## Environment Variables

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Push Notifications (VAPID keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Rate Limiting (optional but recommended)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email (Resend)
RESEND_API_KEY=re_...
```

---

## Testing Checklist

- [ ] All routes require authentication
- [ ] Error responses follow standard format
- [ ] Rate limiting configured
- [ ] RLS policies tested with multiple users
- [ ] AI prompts return expected formats
- [ ] Notifications created correctly
- [ ] Activity feed respects privacy
- [ ] Comment threading works (max 3 levels)
- [ ] Push notifications send successfully
- [ ] Realtime subscriptions update UI

---

**Use this specification to implement all API routes consistently.**
