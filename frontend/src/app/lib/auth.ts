import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
        if (account) {
          token.idToken = account.id_token; // Google から受け取った id_token を保存
        }
        return token;
      },
      async session({ session, token }) {
        session.idToken = token.idToken; // JWT を session に追加
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
};