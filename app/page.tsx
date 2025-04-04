import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Handshake, Phone, Building2, Percent, HomeIcon } from "lucide-react"
// import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const stats = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stats/${session.user.id}`, {
    cache: "no-store",
  }).then((res) => res.json())

  // Helper function to determine if a metric is trending up or down
  // In a real app, you would compare with previous period data
  // const getTrend = (value: number | string) => {
  //   const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  //   return numValue > 1 ? "up" : "down"
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hello, {session.user.name}</h1>
        <p className="text-muted-foreground mt-1">Welcome to your personal dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Leads Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              {/* {getTrend(stats.totalLeads) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  12%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  5%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p> */}
          </CardContent>
        </Card>

        {/* Deals Closed Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Handshake className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.dealsClosed}</div>
              {/* {getTrend(stats.dealsClosed) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  8%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  3%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p> */}
          </CardContent>
        </Card>

        {/* Properties Contacted Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Properties Contacted</CardTitle>
            <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.propertiesContacted}</div>
              {/* {getTrend(stats.propertiesContacted) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  15%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  2%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p> */}
          </CardContent>
        </Card>

        {/* Offers Made Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.offersMade}</div>
              {/* {getTrend(stats.offersMade) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  7%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  4%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p> */}
          </CardContent>
        </Card>

        {/* Active Listings Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <HomeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.activeListings}</div>
              {/* {getTrend(stats.activeListings) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  10%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  1%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>  */}
          </CardContent>
        </Card>

        {/* Deals Closed Rate Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Deals Closed Rate</CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Percent className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{stats.percentageDealsClosed}</div>
              {/* {getTrend(stats.percentageDealsClosed) === "up" ? (
                <span className="text-emerald-500 flex items-center text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  5%
                </span>
              ) : (
                <span className="text-rose-500 flex items-center text-xs font-medium">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  2%
                </span>
              )} */}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Compared to last month</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      {/* <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-4">
              <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-medium">New lead generated</p>
              <p className="text-sm text-muted-foreground">John Smith from Oakwood Properties</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">2 hours ago</div>
          </div>
          <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
              <HomeIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium">New property listed</p>
              <p className="text-sm text-muted-foreground">123 Maple Street, $450,000</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">Yesterday</div>
          </div>
        </div> 
      </div>*/}
    </div>
  )
}

