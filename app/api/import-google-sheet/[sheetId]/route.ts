import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { getValidAccessToken } from "@/app/api/refresh-token";

export async function GET(request: Request) {
  await getValidAccessToken();
  // 1. Require an authenticated session
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    /* ────────────────────────────────────────────────────────────────
       2. Extract the sheetId from the request URL
    ──────────────────────────────────────────────────────────────── */
    const url = new URL(request.url);
    const sheetId = url.pathname.split("/").pop(); // Extract the last segment of the path

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID is required" },
        { status: 400 },
      );
    }

    /* ────────────────────────────────────────────────────────────────
       3. Wrap the raw token in an OAuth2 client so googleapis attaches
          `Authorization: Bearer …` for every request.
    ──────────────────────────────────────────────────────────────── */
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: session.user.accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2 });

    // 4. Fetch the rows you need
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A:Z",
    });

    const rows = data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No data found in sheet" },
        { status: 404 },
      );
    }

    /* ────────────────────────────────────────────────────────────────
       5. Convert raw rows → array of objects keyed by the header row
    ──────────────────────────────────────────────────────────────── */
    const [headerRow, ...bodyRows] = rows;
    const leads = bodyRows.map((row) =>
      headerRow.reduce<Record<string, unknown>>((lead, header, idx) => {
        lead[header as string] = row[idx];
        return lead;
      }, {}),
    );

    return NextResponse.json(leads);
  } catch (err) {
    console.error("Error importing from Google Sheet:", err);
    return NextResponse.json(
      { error: "Failed to import from Google Sheet" },
      { status: 500 },
    );
  }
}
