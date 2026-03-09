/**
 * Project permission helpers.
 * Used by API routes to determine if a user can edit a project.
 */

export interface ProjectWithOwner {
  user_id: string;
  shared_with_all?: boolean;
}

/**
 * Returns true if the user can edit the project (owner or shared-with-all).
 */
export function canEditProject(
  project: ProjectWithOwner,
  userId: string
): boolean {
  if (!userId) return false;
  if (project.shared_with_all) return true;
  return project.user_id === userId;
}
