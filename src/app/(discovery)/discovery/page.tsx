import { redirect } from "next/navigation";

/**
 * Discovery is optional and lives in Settings.
 * This route redirects so old links and bookmarks still work.
 */
export default function DiscoveryPage() {
  redirect("/settings");
}
