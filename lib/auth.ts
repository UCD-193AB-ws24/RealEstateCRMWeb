import { NextAuthOptions, Session } from "next-auth";

import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        authorization: {
          params: {
            scope: [
              "openid",
              "profile",
              "email",
              "https://www.googleapis.com/auth/spreadsheets",
              "https://www.googleapis.com/auth/drive.file",
              "https://www.googleapis.com/auth/drive.readonly",
            ].join(" "),
            access_type: "offline",
            prompt: "consent",
          },
        },
      }),
    ],
    callbacks: {
      async jwt({ token, account }) {
        if (account?.access_token) {
          const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          const userInfo = await res.json();

          console.log("User Info:", userInfo);
          console.log("Account Info:", account);
          console.log(account.access_token);
            
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = Date.now() + account.expires_at! * 1000;
          // Attach user info to token
          token.id = userInfo.id;
          token.name = userInfo.name;
          token.email = userInfo.email;
          token.picture = userInfo.picture;

          try {
            const { google } = await import("googleapis");
            const oauth2 = new google.auth.OAuth2(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET
            );
            oauth2.setCredentials({ refresh_token: token.refreshToken as string | null | undefined });
    
            const { credentials } = await oauth2.refreshAccessToken();
    
            token.accessToken = credentials.access_token!;
            token.expiresAt = credentials.expiry_date!;
            return token;
          } catch (err) {
            console.error("Failed to refresh access token", err);
            token.error = "RefreshAccessTokenError";
            return token;
          }
        }
        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.accessToken = token.accessToken as string;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET as string,
  };