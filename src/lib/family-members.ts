export type FamilyRole = "admin" | "member";

export interface FamilyMemberConfig {
  member_id: string;
  name: string;
  role: FamilyRole;
}

export const FAMILY_MEMBERS: FamilyMemberConfig[] = [
  { member_id: "ryo", name: "Ryo", role: "admin" },
  { member_id: "yoko", name: "Yoko", role: "member" },
  { member_id: "motoharu", name: "Motoharu", role: "member" },
  { member_id: "haruhi", name: "Haruhi", role: "member" },
  { member_id: "natsumi", name: "Natsumi", role: "member" },
];

export function getMemberById(member_id: string): FamilyMemberConfig | undefined {
  return FAMILY_MEMBERS.find((m) => m.member_id === member_id);
}

export function isAdmin(member_id: string): boolean {
  const member = getMemberById(member_id);
  return member?.role === "admin";
}
