import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return true; //ログイン許可
      }
      return false; //ログイン拒否
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.idToken = account.id_token;

        // ✅ クッキーからmode取得
        const cookieStore = await cookies();
        const mode = cookieStore.get("auth_mode")?.value === "signup" ? "signup" : "login";

        const endpoint = `${process.env.BACKEND_API_URL}/auth/${mode}/google`;
        console.log("Using endpoint:", endpoint);

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: token.idToken,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            token.appJwt = data.token; // アプリ用のJWT
            token.userId = data.userId;     // 任意：ユーザーIDなど

          } else {
            const errorText = await res.text();
            console.error("Backend auth failed:", errorText);
            token.authError = "account_exists";
          }
          
        } catch (err) {
          console.error("JWT callback error:", err);
          token.authError = "server_error";
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.appJwt = token.appJwt;
        session.user.userId = token.userId;
        session.authError = token.authError ?? null;
      }
      return session;
    },
  },
};