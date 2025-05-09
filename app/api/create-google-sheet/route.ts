import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isExport } = await request.json();

    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: session.user.accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2 });

    const { data } = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: isExport
            ? "Real Estate Leads Export"
            : "Real Estate Leads Import",
        },
      },
    });

    return NextResponse.json({
      sheetId: data.spreadsheetId,
      sheetName: data.properties?.title,
    });
  } catch (err) {
    console.error("Error creating Google Sheet:", err);
    return NextResponse.json(
      { error: "Failed to create Google Sheet" },
      { status: 500 }
    );
  }
}
