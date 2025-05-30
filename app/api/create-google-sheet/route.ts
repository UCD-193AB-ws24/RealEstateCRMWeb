import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
// import { getValidAccessToken } from "../refresh-token";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newSheetTitle } = await request.json();
    
    // Validate sheet title
    if (!newSheetTitle || typeof newSheetTitle !== 'string' || !newSheetTitle.trim()) {
      return NextResponse.json(
        { error: "Invalid sheet title" },
        { status: 400 }
      );
    }
    
    const sheetTitle = newSheetTitle.trim();
    console.log("Creating sheet with title:", sheetTitle);
    
    // await getValidAccessToken();
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: session.user.accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2 });

    const { data } = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetTitle,
        },
      },
    });
    
    if (!data.spreadsheetId) {
      throw new Error("No spreadsheet ID returned from Google API");
    }
    
    console.log("Sheet created:", data.spreadsheetId, data.properties?.title);

    return NextResponse.json({
      sheetId: data.spreadsheetId,
      sheetName: data.properties?.title,
    });
  } catch (err) {
    console.error("Error creating Google Sheet:", err);
    
    // Handle specific Google API errors
    const error = err as Error;
    if (error.message?.includes('Invalid Credentials')) {
      return NextResponse.json(
        { error: "Authentication failed. Please sign in again." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create Google Sheet" },
      { status: 500 }
    );
  }
}
