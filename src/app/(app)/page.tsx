import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerComponentClient } from "@/lib/supabase-server";
import { NewMemberHome } from "@/components/home/NewMemberHome";
import { ReturningMemberHome } from "@/components/home/ReturningMemberHome";

export default async function HomePage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "User";

  const supabase = await createServerComponentClient();

  // Get user's ID from Supabase
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) {
    // User not synced yet, show new member view
    return <NewMemberHome name={firstName} />;
  }

  // Count user's ideas
  const { count } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .eq("user_id", dbUser.id);

  const ideasCount = count || 0;

  if (ideasCount === 0) {
    return <NewMemberHome name={firstName} />;
  }

  return <ReturningMemberHome name={firstName} />;
}
