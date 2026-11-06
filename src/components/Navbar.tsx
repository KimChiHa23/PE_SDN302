"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-palette-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-palette-500 to-palette-300 flex items-center justify-center text-white font-bold shadow-md shadow-palette-500/20 group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-bold text-xl text-palette-500 tracking-tight">
            ReadLog
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-palette-100/50 animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/reading-logs"
                data-testid="link-reading-logs"
                className="text-sm font-medium text-palette-400 hover:text-palette-500 transition-colors"
              >
                Reading Logs
              </Link>
              <span
                data-testid="user-email"
                className="text-sm font-medium text-slate-700 bg-palette-100/60 px-3 py-1 rounded-full border border-palette-200"
              >
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={handleLogout}
                className="border-palette-300 text-palette-500 hover:bg-palette-100 hover:text-palette-500"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                data-testid="btn-login"
                className="text-palette-500 hover:bg-palette-100/60 hover:text-palette-500"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="sm"
                data-testid="btn-register"
                className="bg-palette-500 hover:bg-palette-400 text-white shadow-sm shadow-palette-500/25"
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
