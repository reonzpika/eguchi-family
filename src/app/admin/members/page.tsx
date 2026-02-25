"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  ideasCount: number;
  projectsCount: number;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/admin/members");
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const handleRoleToggle = async (memberId: string) => {
    setUpdating(memberId);
    try {
      const response = await fetch(`/api/admin/members/${memberId}/role`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const data = await response.json();

      // Update local state
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: data.role } : member
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
      alert("ロールの更新に失敗しました");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
      >
        ← ダッシュボードに戻る
      </button>

      {/* Title */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
        <h1 className="text-lg font-extrabold text-foreground">メンバー管理</h1>
        <p className="mt-1 text-xs text-muted">
          家族メンバーのロールを変更できます
        </p>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="text-center text-sm text-muted">読み込み中...</div>
      ) : members.length === 0 ? (
        <div className="text-center text-sm text-muted">
          メンバーが見つかりませんでした
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-border-warm bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar name={member.name} size={40} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      {member.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        member.role === "admin"
                          ? "bg-primary-light text-primary"
                          : "bg-success-light text-success"
                      }`}
                    >
                      {member.role === "admin" ? "管理者" : "メンバー"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{member.email}</p>
                  <div className="mt-2 flex gap-4 text-xs text-muted">
                    <span>作成日: {formatDate(member.created_at)}</span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted">
                    <span>💡 {member.ideasCount}件</span>
                    <span>📁 {member.projectsCount}件</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRoleToggle(member.id)}
                disabled={updating === member.id}
                className="mt-3 w-full rounded-xl border border-border-warm bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors active:bg-border-warm disabled:opacity-50"
              >
                {updating === member.id
                  ? "更新中..."
                  : `ロールを変更 (現在: ${member.role === "admin" ? "管理者" : "メンバー"})`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
