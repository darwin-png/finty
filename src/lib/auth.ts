import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { organization: true },
        });

        if (!user || !user.active) return null;
        // SUPERADMIN has no organization
        if (user.role !== "SUPERADMIN" && (!user.organization || !user.organization.active)) return null;

        const isValid = await bcryptjs.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          role: user.role,
          organizationId: user.organizationId ?? null,
          organizationSlug: user.organization?.slug ?? null,
          organizationName: user.organization?.name ?? null,
          plan: user.organization?.plan ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          role: string;
          organizationId: string;
          organizationSlug: string;
          organizationName: string;
          plan: string;
        };
        token.role = u.role;
        token.userId = user.id!;
        token.organizationId = u.organizationId;
        token.organizationSlug = u.organizationSlug;
        token.organizationName = u.organizationName;
        token.plan = u.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.userId;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).organizationId = token.organizationId;
        (session.user as Record<string, unknown>).organizationSlug = token.organizationSlug;
        (session.user as Record<string, unknown>).organizationName = token.organizationName;
        (session.user as Record<string, unknown>).plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
