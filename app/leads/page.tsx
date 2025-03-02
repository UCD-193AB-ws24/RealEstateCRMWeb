import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { AlertCircle } from "lucide-react"
import LeadsViewToggle from "@/components/leads/LeadsViewToggle"
import CardView from "@/components/leads/CardView"
import SpreadsheetView from "@/components/leads/SpreadsheetView"

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
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  const leads = await getLeads(session.user.id)
  const sp = await searchParams
  const viewMode = sp.view === "spreadsheet" ? "spreadsheet" : "cards"

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Leads</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Manage and track all your potential clients in one place</p>
      </div>

      {leads.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Showing {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </div>
            <LeadsViewToggle currentView={viewMode} />
          </div>

          {viewMode === "cards" ? <CardView leads={leads} /> : <SpreadsheetView leads={leads} />}
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center max-w-md mx-auto">
      <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No leads found</h2>
      <p className="text-gray-500 mb-6">You don't have any leads yet. Start adding new leads to grow your business.</p>
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        Add Your First Lead
      </button>
    </div>
  )
}

