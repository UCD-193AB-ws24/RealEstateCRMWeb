// app/api/export-leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google }                 from "googleapis";
import { getServerSession }       from "next-auth/next";
import { authOptions }            from "@/lib/auth";
import { Lead }                   from "@/components/leads/types";
// import { getValidAccessToken } from "../refresh-token";


export async function POST(req: NextRequest) {
  try {
    // 1) parse the incoming leads array
    const { leads, sheetId, mode = "replace" } = (await req.json()) as { leads: Lead[], sheetId?: string, mode?: string };

    // await getValidAccessToken();
    // 2) get the user's session (with accessToken)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 3) spin up googleapis with the user's token
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({
      access_token: session.user.accessToken,
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // If no sheetId is provided, create a new spreadsheet
    let spreadsheetId = sheetId;
    let sheetUrl;
    if (!sheetId) {
      const createRes = await sheets.spreadsheets.create({
        requestBody: { properties: { title: "My Leads Export" } },
      });
      spreadsheetId = createRes.data.spreadsheetId!;
      sheetUrl = createRes.data.spreadsheetUrl!;
    }

    // Prepare the data for export
    const headers = Object.keys(leads[0]).filter((key) => key !== "images");
    const rows = leads.map((l) => headers.map((h) => l[h as keyof Lead] || ""));
    const values = [headers, ...rows];

    // Write the data to the sheet
    if (mode === "replace") {
      // Clear existing data first
      await sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: "Sheet1!A:Z"
      });
    }

    // Write the new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: mode === "replace" ? "Sheet1!A1" : "Sheet1!A" + (rows.length + 2),
      valueInputOption: "RAW",
      requestBody: { values },
    });

    // 6) return the JSON with the URL
    if (!sheetUrl) {
      sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }
    return NextResponse.json({ sheetUrl });
  } catch (e: unknown) {
    console.error("export-leads error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
