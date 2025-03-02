"use client"

import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogIn } from "lucide-react"

export default function AuthButton() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-4">
      {session ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full">
            <Avatar className="h-8 w-8 border border-muted-foreground/10">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
              <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{session.user?.name}</span>
          </div>
        </div>
      ) : (
        <Button
          onClick={(e) => {
            e.preventDefault()
            signIn("google", { callbackUrl: "/leads" })
          }}
          className="gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm transition-all duration-200 hover:shadow-md hover:from-blue-600 hover:to-blue-700"
        >
          <LogIn className="h-4 w-4" />
          Sign In with Google
        </Button>
      )}
    </div>
  )
}

