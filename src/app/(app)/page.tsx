import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { TownMap } from "@/components/town/TownMap";

/**
 * Home: the playful isometric town map. Each building is a menu destination,
 * ピコ wanders the town, and the user's business shows as a shop (or a bare lot).
 * The bottom nav (from AppChrome) is kept for fast switching.
 */
export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  type Biz = { id: string; idea: string; current_stage: string; status: string };
  let business: Biz | null = null;

  if (userId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("businesses")
      .select("id, idea, current_stage, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    business = (data?.[0] as Biz) ?? null;
  }

  return <TownMap business={business} />;
}
