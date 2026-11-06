import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, confirmPassword } = body || {}

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (confirmPassword === undefined || confirmPassword === null || (typeof confirmPassword === "string" && !confirmPassword.trim())) {
      return NextResponse.json({ error: "Confirm password is required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

