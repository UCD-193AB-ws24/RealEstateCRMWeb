import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      accessToken: string;
    };
  }
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

// Create the handler
const handler = NextAuth(authOptions);

// Export `GET` and `POST` handlers explicitly
export { handler as GET, handler as POST };
