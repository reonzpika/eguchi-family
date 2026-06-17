import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getMemberById } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Family",
      credentials: {
        member_id: { label: "Member", type: "text" },
      },
      // Family app: no password. Pick your name and you are in. The user row is
      // created on first sign-in if it does not exist yet (e.g. a member who
      // never logged in before).
      async authorize(credentials) {
        if (!credentials?.member_id) {
          return null;
        }
        const memberConfig = getMemberById(credentials.member_id);
        if (!memberConfig) {
          return null;
        }
        const supabase = createAdminClient();
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("member_id", memberConfig.member_id)
          .maybeSingle();

        let userId = existing?.id as string | undefined;
        if (!userId) {
          const { data: created, error: insertError } = await supabase
            .from("users")
            .insert({
              member_id: memberConfig.member_id,
              name: memberConfig.name,
              role: memberConfig.role,
              avatar_color: null,
            })
            .select("id")
            .single();
          if (insertError || !created) {
            console.error("Sign-in user create failed:", insertError);
            return null;
          }
          userId = created.id as string;
        }

        return {
          id: userId,
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
