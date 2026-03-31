import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      organizationId: string;
      organizationSlug: string;
      organizationName: string;
      plan: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    userId: string;
    organizationId: string;
    organizationSlug: string;
    organizationName: string;
    plan: string;
  }
}
