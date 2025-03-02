"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Briefcase, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">est8</h1>

        {/* Navigation Links */}
        <div className="flex gap-6">
          {/* Leads Page */}
          <Link href="/leads" className={`p-2 rounded-md ${pathname === "/leads" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
            <Briefcase size={24} />
          </Link>

          {/* Profile Page */}
          <Link href="/" className={`p-2 rounded-md ${pathname === "/" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
            <User size={24} />
          </Link>

          {/* Sign Out Button (Only if Signed In) */}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-md hover:bg-red-600"
              title="Sign Out"
            >
              <LogOut size={24} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
