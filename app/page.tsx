"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthButton from "@/components/auth/AuthButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Calendar } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Loading your experience...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-4xl overflow-hidden shadow-xl border-muted/20">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">Welcome, {session?.user?.name}!</CardTitle>
              <CardTitle className="text-lg font-medium">ID: {session?.user?.id}</CardTitle>
              <p className="text-blue-100">Your personal dashboard</p>
            </div>
            <AuthButton />
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {session?.user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {session?.user?.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>Logged in today</li>
                  <li>Updated profile picture</li>
                  <li>Completed 2 lessons</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

