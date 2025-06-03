import { NextAuthOptions } from "next-auth";

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
          
          // Check if user exists in our system
          try {
            const baseUrl = process.env.NEXT_PUBLIC_URL || '';
            const userResponse = await fetch(`${baseUrl}/api/users/${userInfo.email}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const userData = await userResponse.json();
            console.log("User Data from API GET:", userData);
            
            // If user exists (not -1), use the returned id, otherwise use Google id
            token.id = userData !== -1 ? userData.userId : userInfo.id;
            console.log("User ID being used:", token.id);
          } catch (error) {
            console.error("Error checking user existence:", error);
            // Fallback to Google ID if API call fails
            token.id = userInfo.id;
          }
          
          // Attach remaining user info to token
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
        console.log("Session Token:", token);

        try {
          const baseUrl = process.env.NEXT_PUBLIC_URL || '';
          const userResponse = await fetch(`${baseUrl}/api/users/${token.email}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const userData = await userResponse.json();
          console.log("User Data from API GET:", userData);
          
          // If user exists (not -1), use the returned id, otherwise use Google id
          session.user.id = userData !== -1 ? userData.userId : token.id as string;
          console.log("User ID being used:", session.user.id);
        } catch (error) {
          console.error("Error checking user existence:", error);
          // Fallback to Google ID if API call fails
          session.user.id = token.id as string;
        }

        // session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.accessToken = token.accessToken as string;


        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET as string,
  };