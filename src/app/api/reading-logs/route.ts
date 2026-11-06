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

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const genre = searchParams.get("genre")
    const favorite = searchParams.get("favorite")
    const q = searchParams.get("q")

    // Fetch user's logs
    let logs = await prisma.readingLog.findMany({
      where: {
        userId: user.id,
      },
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

    // Filter by genre
    if (genre && genre !== "All") {
      logs = logs.filter((log) => log.genre === genre)
    }

    // Filter by favorite
    if (favorite === "true") {
      logs = logs.filter((log) => log.favorite === true)
    }

    // Filter by q (matches bookTitle OR note, case-insensitive, surrounding spaces ignored)
    if (q !== null && q.trim() !== "") {
      const keyword = q.trim().toLowerCase()
      logs = logs.filter(
        (log) =>
          log.bookTitle.toLowerCase().includes(keyword) ||
          (log.note && log.note.toLowerCase().includes(keyword))
      )
    }

    // Sort: readOn descending; ties broken by bookTitle, alphabetically, case-insensitive
    logs.sort((a, b) => {
      if (a.readOn !== b.readOn) {
        return b.readOn.localeCompare(a.readOn)
      }
      return a.bookTitle.toLowerCase().localeCompare(b.bookTitle.toLowerCase())
    })

    const result = logs.map((log) => ({
      id: log.id,
      bookTitle: log.bookTitle,
      minutesRead: log.minutesRead,
      genre: log.genre,
      note: log.note ?? "",
      favorite: log.favorite,
      readOn: log.readOn,
      createdAt: log.createdAt,
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("GET reading-logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { bookTitle, minutesRead, genre, note, readOn } = body || {}

    // Validation: Book title
    if (!bookTitle || typeof bookTitle !== "string" || !bookTitle.trim()) {
      return NextResponse.json({ error: "Book title is required" }, { status: 400 })
    }
    if (bookTitle.length > 80) {
      return NextResponse.json({ error: "Book title must be at most 80 characters" }, { status: 400 })
    }

    // Validation: Minutes read
    if (
      minutesRead === undefined ||
      minutesRead === null ||
      minutesRead === "" ||
      (typeof minutesRead === "string" && !minutesRead.trim()) ||
      isNaN(Number(minutesRead))
    ) {
      return NextResponse.json({ error: "Minutes read is required" }, { status: 400 })
    }
    const numMinutes = Number(minutesRead)
    if (numMinutes <= 0) {
      return NextResponse.json({ error: "Minutes read must be a positive number" }, { status: 400 })
    }

    // Validation: Genre
    if (!genre || typeof genre !== "string" || !genre.trim()) {
      return NextResponse.json({ error: "Please choose a genre" }, { status: 400 })
    }
    if (!VALID_GENRES.includes(genre)) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 })
    }

    // Validation: Date (readOn)
    if (!readOn || typeof readOn !== "string" || !readOn.trim()) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }
    const today = getTodayString()
    if (readOn > today) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 })
    }

    // Check duplicate: same bookTitle, minutesRead and readOn already saved by this user
    const existing = await prisma.readingLog.findFirst({
      where: {
        userId: user.id,
        bookTitle: bookTitle.trim(),
        minutesRead: Math.round(numMinutes),
        readOn: readOn.trim(),
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
        },
        { status: 409 }
      )
    }

    const created = await prisma.readingLog.create({
      data: {
        userId: user.id,
        bookTitle: bookTitle.trim(),
        minutesRead: Math.round(numMinutes),
        genre: genre.trim(),
        note: note ? String(note).trim() : "",
        favorite: false,
        readOn: readOn.trim(),
      },
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

    return NextResponse.json(
      {
        ...created,
        note: created.note ?? "",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST reading-logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

