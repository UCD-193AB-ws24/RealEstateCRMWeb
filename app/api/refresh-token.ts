import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI // optional, needed if redirecting users
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Refresh access token
export async function getValidAccessToken() {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const session = await getServerSession(authOptions);
    if(!session?.user) return;
    session.user.accessToken = credentials.access_token!;
  } catch (err) {
    console.error('Failed to refresh access token:', err);
    throw err;
  }
}
