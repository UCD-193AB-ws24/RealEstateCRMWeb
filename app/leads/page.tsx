import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LeadsViewToggle from "@/components/leads/LeadsViewToggle"
import CardView from "@/components/leads/CardView"
import SpreadsheetView from "@/components/leads/SpreadsheetView"
import MapView from "@/components/leads/MapView"
import NewLeadButton from "@/components/leads/NewLeadButton"
import EmptyState from "@/components/leads/EmptyState"

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
  const viewMode = sp.view === "spreadsheet" ? "spreadsheet" : sp.view === "map" ? "map" : "cards"

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Leads</h1>
        <p className="text-gray-500 mt-1">Manage and track all your potential clients in one place</p>
      </div>

      {leads.length === 0 ? (
        <EmptyState userId={session.user.id} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Showing {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-3">
              <LeadsViewToggle currentView={viewMode} />
              <NewLeadButton userId={session.user.id} />
            </div>
          </div>

          {viewMode === "cards" ? (
            <CardView leads={leads} />
          ) : viewMode === "spreadsheet" ? (
            <SpreadsheetView leads={leads} />
          ) : (
            <MapView leads={leads} />
          )}
        </>
      )}
    </div>
  )
}

