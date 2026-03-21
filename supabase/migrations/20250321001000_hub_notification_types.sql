-- Extend notification_type enum for Family Hub.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'hub_new_tool'
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'hub_new_tool';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'hub_new_mission'
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'hub_new_mission';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'hub_thread_reply'
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'hub_thread_reply';
  END IF;
END $$;
