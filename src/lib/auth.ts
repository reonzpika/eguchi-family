import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getMemberById } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Family",
      credentials: {
        member_id: { label: "Member", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.member_id || !credentials?.password) {
          return null;
        }
        const { member_id, password } = credentials;
        const memberConfig = getMemberById(member_id);
        if (!memberConfig) {
          return null;
        }
        const supabase = createAdminClient();
        const { data: user, error } = await supabase
          .from("users")
          .select("id, password_hash")
          .eq("member_id", member_id)
          .single();

        if (error || !user?.password_hash) {
          return null;
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          return null;
        }
        return {
          id: user.id,
          member_id: memberConfig.member_id,
          name: memberConfig.name,
          role: memberConfig.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.member_id = (user as { member_id?: string }).member_id;
        token.name = user.name;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.member_id = token.member_id as string;
        session.user.name = token.name ?? null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
