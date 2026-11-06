"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LogIn, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    auth?: string
  }>({})

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateEmail = (val: string) => {
    if (!val.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address"
    return undefined
  }

  const validatePassword = (val: string) => {
    if (!val) return "Password is required"
    return undefined
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    if (submitted) {
      const err = validateEmail(val)
      setErrors((prev) => ({ ...prev, email: err, auth: undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPassword(val)
    if (submitted) {
      const err = validatePassword(val)
      setErrors((prev) => ({ ...prev, password: err, auth: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr,
      })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ auth: data.error || "Invalid email or password" })
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event("auth-change"))
      router.push("/reading-logs")
      router.refresh()
    } catch {
      setErrors({ auth: "An unexpected error occurred" })
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-palette-100/40 via-slate-50 to-palette-200/25 relative">
      <Card className="w-full max-w-md shadow-xl border-palette-100/80 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-4 pt-8 bg-gradient-to-b from-palette-100/30 to-transparent">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-palette-500 via-palette-400 to-palette-300 flex items-center justify-center text-white shadow-lg shadow-palette-500/25 mb-1">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Enter your credentials to access your reading logs
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate data-testid="login-form">
          <CardContent className="space-y-4 pt-4">
            {errors.auth && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold shadow-xs animate-in fade-in"
              >
                {errors.auth}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                data-testid="login-email"
                className={`rounded-xl h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-palette-400"}`}
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-red-500 font-semibold mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                data-testid="login-password"
                className={`rounded-xl h-11 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-palette-400"}`}
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-red-500 font-semibold mt-1">
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-3 pb-8">
            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full bg-gradient-to-r from-palette-500 to-palette-400 hover:opacity-95 text-white font-bold h-11 rounded-xl shadow-md shadow-palette-500/20 hover:shadow-palette-500/35 transition-all"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-sm text-center text-slate-500 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-palette-500 hover:text-palette-400 underline underline-offset-4 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
