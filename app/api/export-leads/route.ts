// app/api/export-leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google }                 from "googleapis";
import { getServerSession }       from "next-auth/next";
import { authOptions }            from "@/lib/auth";
import { Lead }                   from "@/components/leads/types";

export async function POST(req: NextRequest) {
  try {
    // 1) parse the incoming leads array
    const { leads } = (await req.json()) as { leads: Lead[] };

    // 2) get the user’s session (with accessToken)
    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 3) spin up googleapis with the user’s token
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({
      access_token: session.user.accessToken,
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // 4) create the spreadsheet
    const createRes = await sheets.spreadsheets.create({
      requestBody: { properties: { title: "My Leads Export" } },
    });
    const spreadsheetId = createRes.data.spreadsheetId!;
    const sheetUrl      = createRes.data.spreadsheetUrl!;

    // 5) write header + rows if we have any leads
    if (leads.length) {
      const headers = Object.keys(leads[0]).filter((key) => key !== "images");
      const values  = [
        headers,
        ...leads.map((l) => headers.map((h) => l[h as keyof Lead] || "")),
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        requestBody: { values },
      });
    }

    // 6) return the JSON with the URL
    return NextResponse.json({ sheetUrl });
  } catch (e: any) {
    console.error("export-leads error:", e);
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
