"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth/client";
import Button from "@/components/ui/Button";

export default function Header() {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/auth/sign-in";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-vinyl-800 bg-vinyl-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-vinyl-50 group-hover:text-accent-purple transition-colors">
                Vinyl View
              </h1>
              <p className="text-xs text-vinyl-400 hidden sm:block">
                {session?.user?.name || "Your Collection"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/"
                  className="px-4 py-2 text-vinyl-200 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors"
                >
                  Collection
                </Link>
                <Link
                  href="/add"
                  className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors shadow-lg shadow-accent-purple/30"
                >
                  + Add Record
                </Link>

                {/* User Menu */}
                <div className="relative flex items-center gap-3 pl-4 border-l border-vinyl-700">
                  <div className="text-right">
                    <p className="text-sm text-vinyl-200">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-vinyl-400">
                      {session.user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-vinyl-300 hover:text-vinyl-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              !isPending && (
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/add"
                  className="p-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors"
                  aria-label="Add Record"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-vinyl-200 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              !isPending && (
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors text-sm"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && session && (
          <div className="md:hidden mt-3 pt-3 border-t border-vinyl-800">
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 text-sm">
                <p className="text-vinyl-200 font-medium">{session.user.name || "User"}</p>
                <p className="text-xs text-vinyl-400">{session.user.email}</p>
              </div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-vinyl-200 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors text-sm"
              >
                Collection
              </Link>
              <Link
                href="/add"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-vinyl-200 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors text-sm"
              >
                Add Record
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="px-3 py-2 text-left text-vinyl-300 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
