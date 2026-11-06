import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

const VALID_GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"]

function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const existing = await prisma.readingLog.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 })
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { bookTitle, minutesRead, genre, note, readOn, favorite } = body || {}

    // Prepare update data
    const updateData: any = {}

    // Validate bookTitle if provided
    if (bookTitle !== undefined) {
      if (typeof bookTitle !== "string" || !bookTitle.trim()) {
        return NextResponse.json({ error: "Book title is required" }, { status: 400 })
      }
      if (bookTitle.length > 80) {
        return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 })
      }
      updateData.bookTitle = bookTitle.trim()
    }

    // Validate minutesRead if provided
    if (minutesRead !== undefined) {
      if (minutesRead === null || minutesRead === "") {
        return NextResponse.json({ error: "Minutes read is required" }, { status: 400 })
      }
      const numMinutes = Number(minutesRead)
      if (isNaN(numMinutes)) {
        return NextResponse.json({ error: "Minutes read is required" }, { status: 400 })
      }
      if (numMinutes <= 0) {
        return NextResponse.json({ error: "Minutes read must be a positive number" }, { status: 400 })
      }
      updateData.minutesRead = Math.round(numMinutes)
    }

    // Validate genre if provided
    if (genre !== undefined) {
      if (typeof genre !== "string" || !genre.trim()) {
        return NextResponse.json({ error: "Please choose a genre" }, { status: 400 })
      }
      if (!VALID_GENRES.includes(genre)) {
        return NextResponse.json({ error: "Invalid genre" }, { status: 400 })
      }
      updateData.genre = genre.trim()
    }

    // Validate readOn if provided
    if (readOn !== undefined) {
      if (typeof readOn !== "string" || !readOn.trim()) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 })
      }
      const today = getTodayString()
      if (readOn > today) {
        return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 })
      }
      updateData.readOn = readOn.trim()
    }

    if (note !== undefined) {
      updateData.note = note ? String(note) : ""
    }

    if (favorite !== undefined) {
      updateData.favorite = Boolean(favorite)
    }

    // Check duplicate if bookTitle, minutesRead, or readOn is changed
    const targetTitle = updateData.bookTitle ?? existing.bookTitle
    const targetMinutes = updateData.minutesRead ?? existing.minutesRead
    const targetDate = updateData.readOn ?? existing.readOn

    if (
      updateData.bookTitle !== undefined ||
      updateData.minutesRead !== undefined ||
      updateData.readOn !== undefined
    ) {
      const duplicate = await prisma.readingLog.findFirst({
        where: {
          userId: user.id,
          id: { not: id },
          bookTitle: targetTitle,
          minutesRead: targetMinutes,
          readOn: targetDate,
        },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            error:
              "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
          },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.readingLog.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        bookTitle: true,
        minutesRead: true,
        genre: true,
        note: true,
        favorite: true,
        readOn: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("PATCH reading-logs/:id error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const existing = await prisma.readingLog.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Reading log not found" }, { status: 404 })
    }

    await prisma.readingLog.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("DELETE reading-logs/:id error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

