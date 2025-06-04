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
import SearchAndFilters from "@/components/leads/SearchAndFilters"

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
  
  // Get search params after awaiting
  const params = await searchParams
  
  // Filter leads based on search and status
  const search = params.search as string | undefined
  const status = params.status as string | undefined
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = !search || 
      (lead.name && lead.name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.address && lead.address.toLowerCase().includes(search.toLowerCase())) ||
      (lead.city && lead.city.toLowerCase().includes(search.toLowerCase())) ||
      (lead.state && lead.state.toLowerCase().includes(search.toLowerCase())) ||
      (lead.owner && lead.owner.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus = !status || lead.status === status || status === "All"
    
    return matchesSearch && matchesStatus
  })

  let viewMode: 'cards' | 'spreadsheet' | 'map' = 'cards'
  if (params.view === 'spreadsheet') viewMode = 'spreadsheet'
  else if (params.view === 'map') viewMode = 'map'

  // Pagination logic
  const LEADS_PER_PAGE = 6;
  let page = params.page ? parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10) : 1;
  const totalLeads = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / LEADS_PER_PAGE));
  // Clamp page to valid range
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const startIdx = (page - 1) * LEADS_PER_PAGE;
  const endIdx = Math.min(startIdx + LEADS_PER_PAGE, totalLeads);
  const paginatedLeads = filteredLeads.slice(startIdx, endIdx);

  function getPageUrl(newPage: number) {
    const urlParams = new URLSearchParams();
    // Copy all existing search params
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => urlParams.append(key, v));
      } else if (value) {
        urlParams.set(key, value);
      }
    });
    // Set the new page
    urlParams.set('page', newPage.toString());
    return `/leads?${urlParams.toString()}`;
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
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Leads</h1>
            <p className="text-gray-500 mt-1">Manage and track all your potential clients in one place</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <LeadsViewToggle currentView={viewMode} />
          </div>
        </div>

        <div className="flex flex-col gap-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto sm:flex-grow">
              <SearchAndFilters />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex flex-col gap-4 min-w-[200px]">
              <div>
                <NewLeadButton userId={session.user.id} />
              </div>
              <div className="text-sm text-gray-500">
                Total: {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex flex-row items-center gap-1">
              {/* <LeadsViewToggle currentView={viewMode} /> */}
              <ImportExport leadsInit={filteredLeads} />
              {/* <NewLeadButton userId={session.user.id} /> */}
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <EmptyState userId={session.user.id} />
        ) : (
          <>
            {viewMode === "cards" ? (
              <CardView leads={paginatedLeads} />
            ) : viewMode === "spreadsheet" ? (
              <SpreadsheetView leads={paginatedLeads} />
            ) : (
              // <MapView leads={paginatedLeads} />
                <MapView leads={filteredLeads} />
              )}

              {/* Pagination UI */}
              {viewMode !== "map" && (
                <div className="flex justify-center items-center mt-8 gap-2 flex-col">
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  {page === 1 ? (
                  <span className="px-3 py-1 rounded border text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed border-[#926bf4]/50">{"<"}</span>
                  ) : (
                  <a
                    href={getPageUrl(page - 1)}
                    className="px-3 py-1 rounded border text-sm font-medium bg-white text-[#7C3AED] hover:bg-[#926bf4]/20 border-[#926bf4]/50 transition-colors"
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
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                      : 'bg-white text-[#7C3AED] hover:bg-[#926bf4]/20 border-[#926bf4]/50'
                    }`}
                  >
                    {i + 1}
                  </a>
                  ))}
                  {/* Next Button */}
                  {page === totalPages ? (
                  <span className="px-3 py-1 rounded border text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed border-[#926bf4]/50">{">"}</span>
                  ) : (
                  <a
                    href={getPageUrl(page + 1)}
                    className="px-3 py-1 rounded border text-sm font-medium bg-white text-[#7C3AED] hover:bg-[#926bf4]/20 border-[#926bf4]/50 transition-colors"
                  >
                    {">"}
                  </a>
                  )}
                </div>
                <span className="text-sm text-slate-500 mt-2">Page {page} of {totalPages}</span>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  )
}
