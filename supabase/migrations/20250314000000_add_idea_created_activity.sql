-- Add idea_created to activity_type so we can record when a user saves a new idea (shows on feed).
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'idea_created';
