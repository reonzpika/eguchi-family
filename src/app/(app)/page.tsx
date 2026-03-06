import { getServerSession } from "next-auth";
import { createServerComponentClient } from "@/lib/supabase-server";
import { NewMemberHome } from "@/components/home/NewMemberHome";
import { ReturningMemberHome } from "@/components/home/ReturningMemberHome";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const name = session.user.name ?? "User";
  const firstName = name.split(" ")[0] || name;

  const supabase = await createServerComponentClient();

  const { count } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  const ideasCount = count ?? 0;

  if (ideasCount === 0) {
    return <NewMemberHome name={firstName} />;
  }

  return <ReturningMemberHome name={firstName} />;
}
