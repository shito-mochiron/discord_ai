import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
        try{
          const res = await fetch(`${process.env.BACKEND_API_URL}/auth/login/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: token.idToken,
            }),
          });
          console.log("u", token.idToken)
          console.log("i", res)

          // token.appJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MGZlNTI3OC03ZGEzLTRiN2UtOWU2ZC1lOTdiMGJiNGM4NDkiLCJpYXQiOjE3NDM3MjQwMzEsImV4cCI6MTc0MzcyNzYzMX0.izGTq_rE25kUtnnZieQjjasvGQb0qP4aUSrOCEW4-PI"

          if (res.ok) {
            const data = await res.json();
            token.appJwt = data.token; // アプリ用のJWT
            token.userId = data.userId;     // 任意：ユーザーIDなど

          } else {
            console.error("Backend auth failed:", await res.text());
          }
          
        } catch (err) {
          console.error("JWT callback error:", err);
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      //console.log("Session Token:", token)

      if (session.user) {
        session.user.appJwt = token.appJwt;
        session.user.userId = token.userId;
      }
      console.log("Session in session callback:", session);

      return session;
    },
  },
};