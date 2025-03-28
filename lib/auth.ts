import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    callbacks: {
      async jwt({ token, account }) {
        if (account?.access_token) {
          const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          const userInfo = await res.json();
  
          // Attach user info to token
          token.id = userInfo.id;
          token.name = userInfo.name;
          token.email = userInfo.email;
          token.picture = userInfo.picture;
        }
        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET as string,
  };