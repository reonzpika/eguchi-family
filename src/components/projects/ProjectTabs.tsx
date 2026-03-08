"use client";

export type ProjectTabId = "milestones" | "living-doc" | "history" | "reflection" | "comments";

interface ProjectTabsProps {
  activeTab: ProjectTabId;
  onTabChange: (tab: ProjectTabId) => void;
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const tabs: { id: ProjectTabId; label: string }[] = [
    { id: "milestones", label: "マイルストーン" },
    { id: "living-doc", label: "内容" },
    { id: "history", label: "更新履歴" },
    { id: "reflection", label: "振り返り" },
    { id: "comments", label: "コメント" },
  ];

  return (
    <div className="mb-6 flex gap-2 border-b border-border-warm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`min-h-[48px] pb-2 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-primary text-primary"
              : "text-muted"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
