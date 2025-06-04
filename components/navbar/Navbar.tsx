"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Briefcase, User, LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div>
        <Image src="/est8_notextbg.png" alt="est8" width={32} height={32} />
        <h1 className="flex items-center gap-2">est8</h1>
        </div>
        {/* Navigation Links */}
        <div className="flex gap-6">
          {/* Leads Page */}
          <Link href="/leads" className={`p-2 rounded-md ${pathname === "/leads" ? "bg-[#7C3AED]" : "hover:bg-gray-700"}`}>
            <Briefcase size={24} />
          </Link>

          {/* Profile Page */}
          <Link href="/" className={`p-2 rounded-md ${pathname === "/" ? "bg-[#7C3AED]" : "hover:bg-gray-700"}`}>
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
