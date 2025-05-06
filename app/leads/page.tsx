import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LeadsViewToggle from "@/components/leads/LeadsViewToggle"
import CardView from "@/components/leads/CardView"
import SpreadsheetView from "@/components/leads/SpreadsheetView"
import MapView from "@/components/leads/MapView"
import NewLeadButton from "@/components/leads/NewLeadButton"
import EmptyState from "@/components/leads/EmptyState"
import ImportExport from "@/components/leads/ImportExport"

async function updateUser(user: { id: string, name: string, email: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: user.id, name: user.name, email: user.email }),
  })
  if (!res.ok) {
    throw new Error("Failed to update user")
  }
  return res.json()
}

async function getLeads(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/${userId}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch leads")
  }
  return res.json()
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  await updateUser(session.user)
  const leads = await getLeads(session.user.id)
  const sp = await searchParams
  let viewMode: 'cards' | 'spreadsheet' | 'map' = 'cards'
  if (sp.view === 'spreadsheet') viewMode = 'spreadsheet'
  else if (sp.view === 'map') viewMode = 'map'

  // Pagination logic
  const LEADS_PER_PAGE = 2;
  let page = sp.page ? parseInt(Array.isArray(sp.page) ? sp.page[0] : sp.page, 10) : 1;
  const totalLeads = leads.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / LEADS_PER_PAGE));
  // Clamp page to valid range
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const startIdx = (page - 1) * LEADS_PER_PAGE;
  const endIdx = Math.min(startIdx + LEADS_PER_PAGE, totalLeads);
  const paginatedLeads = leads.slice(startIdx, endIdx);

  function getPageUrl(newPage: number) {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set('page', newPage.toString());
    return `/leads?${params.toString()}`;
  }

  /*
  async function handleExport() {
    if (!session?.user.accessToken) return alert("Not signed in");
    const res = await fetch("/api/export-leads", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ leads: leads }),
    });
    const { sheetUrl } = await res.json();
    window.open(sheetUrl, "_blank");
  }*/

  return (
    <div className="max-w-7xl mx-auto p-6">
      <main className="flex-grow container mx-auto p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Leads</h1>
            <p className="text-gray-500 mt-1">Manage and track all your potential clients in one place</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <LeadsViewToggle currentView={viewMode} />
          </div>
        </div>


        {leads.length === 0 ? (
          <EmptyState userId={session.user.id} />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Total: {leads.length} lead{leads.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-3 flex-col sm:flex-row sm:gap-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-3">
                    <NewLeadButton userId={session.user.id} />
                    <ImportExport leadsInit={leads} showOnlyImport />
                  </div>
                  <div className="flex items-center gap-3">
                    <ImportExport leadsInit={leads} showOnlyExportAndCount />
                  </div>
                </div>
              </div>
            </div>

            {viewMode === "cards" ? (
              <CardView leads={paginatedLeads} />
            ) : viewMode === "spreadsheet" ? (
              <SpreadsheetView leads={paginatedLeads} />
            ) : (
              <MapView leads={paginatedLeads} />
            )}

            {/* Pagination UI */}
            <div className="flex justify-center items-center mt-8 gap-2 flex-col">
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                {page === 1 ? (
                  <span className="px-3 py-1 rounded border text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed border-blue-200">{"<"}</span>
                ) : (
                  <a
                    href={getPageUrl(page - 1)}
                    className="px-3 py-1 rounded border text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 border-blue-200 transition-colors"
                  >
                    {"<"}
                  </a>
                )}
                {/* Numbered Page Buttons */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <a
                    key={i + 1}
                    href={getPageUrl(i + 1)}
                    className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                      page === i + 1
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'
                    }`}
                  >
                    {i + 1}
                  </a>
                ))}
                {/* Next Button */}
                {page === totalPages ? (
                  <span className="px-3 py-1 rounded border text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed border-blue-200">{">"}</span>
                ) : (
                  <a
                    href={getPageUrl(page + 1)}
                    className="px-3 py-1 rounded border text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 border-blue-200 transition-colors"
                  >
                    {">"}
                  </a>
                )}
              </div>
              <span className="text-sm text-slate-500 mt-2">Page {page} of {totalPages}</span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

