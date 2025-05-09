import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get the access token from the session
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: session.user.accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2 });

    // Get the user's Google Sheets
    const { data } = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id,name)",
      pageSize: 100,
    });

    return NextResponse.json(data.files ?? []);
  } catch (err) {
    console.error("Error getting Google Sheets:", err);
    return NextResponse.json(
      { error: "Failed to get Google Sheets" },
      { status: 500 }
    );
  }
}