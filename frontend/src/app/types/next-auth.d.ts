import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      appJwt?: string;
      userId?: string;
      role?: string;
      statusCode?: number;
    } & DefaultSession["user"];
    authError?: number | null;
  }

  interface User {
    appJwt?: string;
    userId?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appJwt?: string;
    userId?: string;
    role?: string;
    statusCode?: number;
    authError?: number | null;
  }
}
