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
    // async signIn({ user, account, profile }) {
    //   console.log("signin:", user, account, profile);
    // //   if (account.email.endWith("@example.com")) {
    // //     return true;  // ログイン許可
    // //   }
    // //   return false;   // ログイン拒否
    // // }
    // return true;
    // },
    async session({ session, token }) {
      const res = await fetch(`${process.env.BACKEND_API_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.idToken}`,
          },
        });
        console.log("i", res)
        
      // const res = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MGZlNTI3OC03ZGEzLTRiN2UtOWU2ZC1lOTdiMGJiNGM4NDkiLCJpYXQiOjE3NDM3MjQwMzEsImV4cCI6MTc0MzcyNzYzMX0.izGTq_rE25kUtnnZieQjjasvGQb0qP4aUSrOCEW4-PI"

        if (res.ok) {
          const data = await res.json();
          session.user.id = data.userID;
          session.user.role = data.role;
        }

      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
      }
      return token;
    },
  },
};
