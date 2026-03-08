# Family Workspace - Component Inventory

**Framework:** Next.js 16 (App Router) + React 19  
**Styling:** Tailwind CSS v4  
**State:** React hooks + Supabase Realtime

---

## Component Organization

```
src/
├── components/
│   ├── ui/                    # Reusable design system components
│   ├── discovery/             # Onboarding assessment
│   ├── ideas/                 # Idea validation flow
│   ├── projects/              # Project management
│   ├── feed/                  # Activity feed
│   ├── comments/              # Comments & reactions
│   ├── reflections/           # Weekly reflections
│   ├── notifications/         # Notification system
│   └── layout/                # Navigation, headers
```

---

## UI Components (Design System)

### `components/ui/Button.tsx`

Thumb-friendly button with variants.

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}
```

**Variants:**
- Primary: Terracotta background, white text
- Secondary: White background, terracotta border

**Accessibility:**
- Min height: 48px
- Active scale: 0.97
- Focus outline: 2px terracotta

---

### `components/ui/Card.tsx`

Organic rounded card with optional interaction.

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**Features:**
- Border radius: 16px
- Subtle shadow: 0 2px 8px rgba(0,0,0,0.04)
- Interactive: scale(0.98) on press if onClick

---

### `components/ui/ProgressBar.tsx`

Warm terracotta progress indicator.

**Props:**
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}
```

**Features:**
- Fully rounded ends
- Smooth animation (0.3s ease)
- Warm colors from design system

---

### `components/ui/Avatar.tsx`

Family member avatar with unique colors.

**Props:**
```typescript
interface AvatarProps {
  name: string; // 'Ryo', 'Yoko', etc.
  size?: number; // Default 32px
}
```

**Color Mapping:**
```typescript
{
  Ryo: '#2A9D5F',
  Yoko: '#F4A259',
  Haruhi: '#9B6FD9',
  Natsumi: '#E85D4A',
  Motoharu: '#5BA3D0'
}
```

**Features:**
- 2.5px colored border
- 18% opacity background
- Initials centered
- Shrink-0 for flex containers

---

### `components/ui/Input.tsx`

Mobile-optimized text input.

**Props:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Features:**
- Min height: 48px
- Font size: 16px (prevents iOS zoom)
- Focus: terracotta border
- Error state with message

---

### `components/ui/Textarea.tsx`

Multi-line text input.

**Props:**
```typescript
interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}
```

---

### `components/ui/Badge.tsx`

Small status indicator.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}
```

**Variants:**
- Success: Forest green
- Warning: Warm amber
- Error: Dark red-orange
- Default: Muted grey

---

## Layout Components

### `components/layout/Header.tsx`

Screen header with back button and title.

**Props:**
```typescript
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Features:**
- Fixed height: 56px
- Back button left (if showBack)
- Title centered
- Optional action right
- Border bottom: warm tan

---

### `components/layout/BottomNav.tsx`

Main navigation bar.

**Props:**
```typescript
interface BottomNavProps {
  currentRoute: 'home' | 'ideas' | 'projects' | 'menu';
}
```

**Tabs:**
```typescript
[
  { id: 'home', label: 'ホーム', emoji: '🏠' },
  { id: 'ideas', label: 'アイデア', emoji: '💡' },
  { id: 'projects', label: 'プロジェクト', emoji: '📁' },
  { id: 'menu', label: 'メニュー', emoji: '☰' }
]
```

**Features:**
- Fixed bottom, 64px height
- Active indicator dot
- Min 48px touch targets
- Safe area padding for notched phones

---

### `components/layout/MobileContainer.tsx`

Centered mobile viewport wrapper.

**Props:**
```typescript
interface MobileContainerProps {
  children: React.ReactNode;
}
```

**Features:**
- Max width: 390px
- Centered on desktop
- Cream background
- Subtle shadow

---

## Discovery Components

### `components/discovery/AssessmentQuestion.tsx`

Single assessment question screen.

**Props:**
```typescript
interface AssessmentQuestionProps {
  question: {
    emoji: string;
    q: string;
    type: 'text' | 'buttons' | 'scale';
    placeholder?: string;
    options?: string[] | { label: string; value: number }[];
  };
  onAnswer: (answer: any) => void;
  progress: number; // 0-100
  currentStep: number;
  totalSteps: number;
}
```

**Variants:**
- Text: Large input + submit button
- Buttons: List of large tap targets
- Scale: Emoji scale 1-5

---

### `components/discovery/SuperpowerCard.tsx`

Display user's generated superpower.

**Props:**
```typescript
interface SuperpowerCardProps {
  title: string;
  description: string;
  suggestedIdeas: Array<{
    emoji: string;
    title: string;
    description: string;
  }>;
}
```

**Features:**
- Warm gradient background
- Confetti animation on mount
- Idea suggestions below

---

## Idea Components

### `components/ideas/IdeaChat.tsx`

AI conversation interface for idea validation.

**Props:**
```typescript
interface IdeaChatProps {
  ideaId: string;
  initialMessages: ChatMessage[];
}
```

**State:**
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

**Features:**
- Message bubbles (AI left, user right)
- Quick reply buttons (from AI options)
- Typing indicator
- Auto-scroll to latest message

---

### `components/ideas/BusinessSummary.tsx`

Display AI-generated business summary.

**Props:**
```typescript
interface BusinessSummaryProps {
  summary: ValidationSummary;
  onSaveIdea: () => void;
  onPromoteToProject: () => void;
}
```

**Sections:**
- Idea title + description
- Target customer
- Problem & solution
- Pricing
- Reality checks
- Next immediate step

---

### `components/ideas/IdeaCard.tsx`

List item for user's ideas.

**Props:**
```typescript
interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}
```

**Display:**
- Title + emoji
- Status: "exploring" | "validated" | "promoted"
- Last activity timestamp

---

## Project Components

### `components/projects/ProjectCard.tsx`

Project list item with quick stats.

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}
```

**Display:**
- Title + emoji
- Stage badge
- Progress bar
- Last activity time
- Asymmetric stagger (alternate left/right)

---

### `components/projects/ProjectHeader.tsx`

Project detail page header.

**Props:**
```typescript
interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
}
```

**Display:**
- Back button
- Title + emoji
- Owner avatar
- Stage breadcrumb

---

### `components/projects/AtAGlanceCard.tsx`

Current milestone and progress summary.

**Props:**
```typescript
interface AtAGlanceCardProps {
  currentMilestone: Milestone | null;
  progress: {
    overall_percentage: number;
    completed_milestones: number;
    total_milestones: number;
  };
  aiInsight?: string;
}
```

**Display:**
- Current milestone title
- Task completion (X of Y done)
- Overall progress bar
- AI insight bubble (warm background)

---

### `components/projects/MilestoneCard.tsx`

Single milestone with tasks.

**Props:**
```typescript
interface MilestoneCardProps {
  milestone: Milestone;
  tasks: Task[];
  onStartMilestone?: () => void;
  onCompleteMilestone?: () => void;
  onToggleTask?: (taskId: string) => void;
}
```

**States:**
- Not started: Greyed, collapsed
- In progress: Expanded, tasks visible
- Completed: Collapsed to bottom, green checkmark

**Features:**
- Task checkboxes
- Progress calculation
- Celebration on complete

---

### `components/projects/LivingDocument.tsx`

Dynamic strategy document display/edit.

**Props:**
```typescript
interface LivingDocumentProps {
  document: LivingDocument;
  framework: FrameworkType;
  onUpdate?: (field: string, value: string) => void;
  readonly?: boolean;
}
```

**Sections (based on framework):**
- Vision
- Target Customer
- Problem
- Solution
- Revenue Model
- Key Metrics
- Risks

**Features:**
- Inline editing (if not readonly)
- Section-based commenting
- Last updated timestamp

---

### `components/projects/ProjectTabs.tsx`

Tab navigation for project screens.

**Props:**
```typescript
interface ProjectTabsProps {
  activeTab: 'milestones' | 'living-doc' | 'comments';
  onTabChange: (tab: string) => void;
  commentCount?: number;
}
```

---

## Feed Components

### `components/feed/ActivityCard.tsx`

Single activity feed item.

**Props:**
```typescript
interface ActivityCardProps {
  activity: ActivityFeed & {
    user: { id: string; name: string };
  };
  onClick?: () => void;
}
```

**Display:**
- User avatar
- Activity emoji
- Activity description
- Related project (if not private)
- Timestamp
- Stagger effect (alternate offsets)

---

### `components/feed/StatsCards.tsx`

User's idea and project counts.

**Props:**
```typescript
interface StatsCardsProps {
  ideaCount: number;
  projectCount: number;
}
```

**Layout:**
- 2-column grid
- Slightly offset vertically
- Emoji + count + label

---

## Comment Components

### `components/comments/CommentThread.tsx`

Nested comment display.

**Props:**
```typescript
interface CommentThreadProps {
  comments: Comment[];
  onReply: (parentId: string, content: string) => void;
  onReact: (commentId: string, emoji: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}
```

**Features:**
- Nested up to 3 levels
- Collapse threads >5 replies
- Reaction counts
- Edit within 24h
- @mention highlighting

---

### `components/comments/CommentInput.tsx`

Comment compose box.

**Props:**
```typescript
interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

**Features:**
- Auto-resize textarea
- Character count (optional)
- @mention autocomplete
- Submit/cancel buttons

---

### `components/comments/ReactionPicker.tsx`

Emoji reaction selector.

**Props:**
```typescript
interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  existing?: string[]; // Already reacted
}
```

**Emojis:**
```typescript
['👍', '❤️', '🎉', '💡', '🤔']
```

---

## Reflection Components

### `components/reflections/WeeklyReflectionForm.tsx`

Three-question reflection interface.

**Props:**
```typescript
interface WeeklyReflectionFormProps {
  projectId: string;
  onSubmit: (responses: {
    what_worked: string;
    wins: string;
    blockers: string;
  }) => void;
}
```

**Questions:**
1. What did you work on?
2. Any wins?
3. What's blocking you?

**Features:**
- Conversational tone
- Optional questions (not required)
- AI insight preview on submit

---

### `components/reflections/ReflectionInsight.tsx`

Display AI-generated insight from reflection.

**Props:**
```typescript
interface ReflectionInsightProps {
  insight: string;
  livingDocUpdated?: boolean;
  newMilestonesGenerated?: boolean;
}
```

---

## Notification Components

### `components/notifications/NotificationBell.tsx`

Notification icon with unread count.

**Props:**
```typescript
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}
```

**Features:**
- Badge with count
- Pulse animation if unread
- Opens notification list

---

### `components/notifications/NotificationList.tsx`

Notification center.

**Props:**
```typescript
interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}
```

**Features:**
- Unread indicator
- Group by date
- Swipe to dismiss
- Navigate to related content

---

### `components/notifications/PushPermissionPrompt.tsx`

Request push notification permission.

**Props:**
```typescript
interface PushPermissionPromptProps {
  onAllow: () => void;
  onDismiss: () => void;
}
```

**Display:**
- Friendly explanation
- Benefits of push notifications
- Allow/Not Now buttons

---

## Shared/Utility Components

### `components/shared/Loading.tsx`

Loading spinner with optional message.

**Props:**
```typescript
interface LoadingProps {
  message?: string;
}
```

---

### `components/shared/EmptyState.tsx`

Empty state placeholder.

**Props:**
```typescript
interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### `components/shared/ConfettiCelebration.tsx`

Confetti animation for celebrations.

**Props:**
```typescript
interface ConfettiCelebrationProps {
  trigger: boolean;
  duration?: number; // Default 3000ms
}
```

**Used for:**
- Assessment complete
- Milestone completion
- Project creation

---

### `components/shared/ErrorBoundary.tsx`

Error boundary wrapper.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

---

## Page Components (App Router)

### `app/(authenticated)/page.tsx`

Home/Activity Feed page.

**Features:**
- Welcome message
- Stats cards
- Activity feed
- New idea CTA
- Bottom nav

---

### `app/(authenticated)/ideas/page.tsx`

Ideas list page.

**Features:**
- All user ideas
- Filter by status
- Create new idea button

---

### `app/(authenticated)/ideas/[id]/page.tsx`

Idea detail with chat.

**Features:**
- Chat interface
- Business summary (if validated)
- Promote to project button

---

### `app/(authenticated)/projects/page.tsx`

Projects list page.

**Features:**
- Active projects
- Archived toggle
- Create project button

---

### `app/(authenticated)/projects/[id]/page.tsx`

Project detail page.

**Features:**
- At-a-glance card
- Tabs: Milestones | Living Doc | Comments
- Realtime updates

---

### `app/onboarding/page.tsx`

Discovery assessment flow.

**Features:**
- Multi-step form
- Progress indicator
- AI superpower generation
- Suggested ideas

---

## Hooks

### `hooks/useSupabaseRealtime.ts`

Subscribe to Supabase realtime updates.

```typescript
function useSupabaseRealtime(
  table: string,
  filter?: string
): {
  data: any[];
  isLoading: boolean;
  error: Error | null;
}
```

---

### `hooks/useNotifications.ts`

Manage notifications state.

```typescript
function useNotifications(): {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refetch: () => void;
}
```

---

### `hooks/usePushSubscription.ts`

Manage push notification subscription.

```typescript
function usePushSubscription(): {
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  isLoading: boolean;
}
```

---

## Component Checklist

**UI Components (8):**
- [ ] Button
- [ ] Card
- [ ] ProgressBar
- [ ] Avatar
- [ ] Input
- [ ] Textarea
- [ ] Badge
- [ ] Loading

**Layout (3):**
- [ ] Header
- [ ] BottomNav
- [ ] MobileContainer

**Discovery (2):**
- [ ] AssessmentQuestion
- [ ] SuperpowerCard

**Ideas (3):**
- [ ] IdeaChat
- [ ] BusinessSummary
- [ ] IdeaCard

**Projects (6):**
- [ ] ProjectCard
- [ ] ProjectHeader
- [ ] AtAGlanceCard
- [ ] MilestoneCard
- [ ] LivingDocument
- [ ] ProjectTabs

**Feed (2):**
- [ ] ActivityCard
- [ ] StatsCards

**Comments (3):**
- [ ] CommentThread
- [ ] CommentInput
- [ ] ReactionPicker

**Reflections (2):**
- [ ] WeeklyReflectionForm
- [ ] ReflectionInsight

**Notifications (3):**
- [ ] NotificationBell
- [ ] NotificationList
- [ ] PushPermissionPrompt

**Shared (3):**
- [ ] EmptyState
- [ ] ConfettiCelebration
- [ ] ErrorBoundary

**Hooks (3):**
- [ ] useSupabaseRealtime
- [ ] useNotifications
- [ ] usePushSubscription

---

**Total: 36 components + 3 hooks**

**All components should:**
- Use design system tokens
- Meet WCAG AAA accessibility
- Support mobile-first responsive
- Include TypeScript types
- Handle loading/error states
