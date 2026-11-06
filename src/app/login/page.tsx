"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

      router.push("/reading-logs")
      router.refresh()
    } catch {
      setErrors({ auth: "An unexpected error occurred" })
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-palette-100/30 via-slate-50 to-palette-200/20">
      <Card className="w-full max-w-md shadow-xl border-palette-100 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-palette-500 to-palette-300 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-palette-500/20 mb-2">
            R
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-palette-500">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter your credentials to access your reading logs
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate data-testid="login-form">
          <CardContent className="space-y-4">
            {errors.auth && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-600 font-medium"
              >
                {errors.auth}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                data-testid="login-email"
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-palette-100 focus-visible:ring-palette-400"}
              />
              {errors.email && (
                <p data-testid="error-email" className="text-xs text-red-500 font-medium mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                data-testid="login-password"
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-palette-100 focus-visible:ring-palette-400"}
              />
              {errors.password && (
                <p data-testid="error-password" className="text-xs text-red-500 font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full bg-palette-500 hover:bg-palette-400 text-white font-medium py-2 rounded-lg shadow-md shadow-palette-500/20 transition-all hover:shadow-palette-500/30"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-sm text-center text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-palette-400 hover:text-palette-500 underline underline-offset-4"
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
