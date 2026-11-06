"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Sparkles } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()

    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener("auth-change", handleAuthChange)
    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [checkAuth, pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      window.dispatchEvent(new Event("auth-change"))
      router.push("/login")
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="w-full bg-white/85 backdrop-blur-lg border-b border-palette-100/80 sticky top-0 z-50 transition-all shadow-[0_2px_15px_-3px_rgba(91,55,101,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-palette-500 via-palette-400 to-palette-300 flex items-center justify-center text-white shadow-md shadow-palette-500/25 group-hover:scale-105 group-hover:shadow-palette-500/40 transition-all duration-200">
            <BookOpen className="w-5 h-5 text-white/95" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-palette-500 to-palette-400 bg-clip-text text-transparent">
              ReadLog
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-palette-400 -mt-1 hidden sm:block">
              Reading Tracker
            </span>
          </div>
        </Link>

        {/* Navigation & User actions */}
        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-28 bg-palette-100/50 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/reading-logs"
                data-testid="link-reading-logs"
                className="text-sm font-semibold text-slate-700 hover:text-palette-500 px-3 py-1.5 rounded-lg hover:bg-palette-100/40 transition-all"
              >
                Reading Logs
              </Link>
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-palette-100/50 to-palette-200/30 border border-palette-200/60 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span
                  data-testid="user-email"
                  className="text-xs font-semibold text-slate-700"
                >
                  {user.email}
                </span>
              </div>

              {/* Mobile email */}
              <span
                data-testid="user-email"
                className="sm:hidden text-xs font-semibold text-slate-700 bg-palette-100/60 px-2.5 py-1 rounded-full border border-palette-200 truncate max-w-[120px]"
              >
                {user.email}
              </span>

              <Button
                variant="outline"
                size="sm"
                data-testid="btn-logout"
                onClick={handleLogout}
                className="border-palette-200 text-palette-500 hover:bg-palette-100/70 hover:text-palette-500 hover:border-palette-300 font-semibold shadow-sm transition-all flex items-center gap-1.5 rounded-lg text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                data-testid="btn-login"
                className="text-palette-500 hover:bg-palette-100/60 hover:text-palette-500 font-semibold rounded-lg text-sm"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="sm"
                data-testid="btn-register"
                className="bg-gradient-to-r from-palette-500 to-palette-400 hover:from-palette-500 hover:to-palette-500 text-white font-semibold shadow-md shadow-palette-500/20 hover:shadow-palette-500/35 transition-all rounded-lg text-sm px-4"
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
