import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    member_id?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      member_id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    member_id?: string;
    role?: string;
  }
}
