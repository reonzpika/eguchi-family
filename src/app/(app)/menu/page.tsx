"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/ui/Avatar";

interface FamilyMember {
  id: string;
  name: string;
  email: string | null;
  member_id: string | null;
}

export default function MenuPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFamilyMembers() {
      try {
        const { data: usersData, error } = await supabase
          .from("users")
          .select("id, name, email, member_id")
          .not("member_id", "is", null)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching users:", error);
        } else {
          setFamilyMembers(usersData || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFamilyMembers();
  }, [supabase]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/sign-in");
    router.refresh();
  };

  if (!session?.user?.name) {
    return null;
  }

  const firstName = session.user.name.split(" ")[0] || session.user.name;

  const isCurrentUser = (member: FamilyMember) => {
    return member.member_id === session.user.member_id;
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
      {/* User profile card */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary-light to-secondary p-4">
        <div className="flex items-center gap-3">
          <Avatar name={firstName} size={48} />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{firstName}</h2>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="mb-6 flex flex-col gap-3">
        <button
          onClick={() => router.push("/feed")}
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              📋 家族の活動
            </div>
            <div className="mt-1 text-xs text-muted">みんなの進捗を見る</div>
          </div>
          <span className="text-muted">→</span>
        </button>

        <button
          onClick={() => router.push("/notifications")}
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              🔔 通知
            </div>
            <div className="mt-1 text-xs text-muted">お知らせを確認する</div>
          </div>
          <span className="text-muted">→</span>
        </button>

        <button
          onClick={() => router.push("/showcase")}
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              🏢 ファミリーショーケース
            </div>
            <div className="mt-1 text-xs text-muted">みんなのビジネスを見る</div>
          </div>
          <span className="text-muted">→</span>
        </button>

        <button
          onClick={() => router.push("/learning")}
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              📚 学習リソース
            </div>
            <div className="mt-1 text-xs text-muted">スキルアップしよう</div>
          </div>
          <span className="text-muted">→</span>
        </button>
      </div>

      {/* Family members section */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-bold text-foreground">家族メンバー</h3>
        {loading ? (
          <div className="text-sm text-muted">読み込み中...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-border-warm bg-white p-3"
              >
                <Avatar name={member.name} size={32} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {member.name}
                    </span>
                    {isCurrentUser(member) && (
                      <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                        (あなた)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="mt-auto rounded-xl border-2 border-border-warm bg-white px-5 py-3 text-sm font-semibold text-muted transition-colors active:bg-border-warm"
      >
        ログアウト
      </button>
    </div>
  );
}
