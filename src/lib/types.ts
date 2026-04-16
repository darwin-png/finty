import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      organizationId: string | null;
      organizationSlug: string | null;
      organizationName: string | null;
      plan: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    userId: string;
    organizationId: string | null;
    organizationSlug: string | null;
    organizationName: string | null;
    plan: string | null;
  }
}
