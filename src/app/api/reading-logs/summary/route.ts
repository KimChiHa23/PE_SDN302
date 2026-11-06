import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

const GENRE_PRIORITY = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"]

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
    })

    // Filter by genre
    if (genre && genre !== "All") {
      logs = logs.filter((log) => log.genre === genre)
    }

    // Filter by favorite
    if (favorite === "true") {
      logs = logs.filter((log) => log.favorite === true)
    }

    // Filter by q
    if (q !== null && q.trim() !== "") {
      const keyword = q.trim().toLowerCase()
      logs = logs.filter(
        (log) =>
          log.bookTitle.toLowerCase().includes(keyword) ||
          (log.note && log.note.toLowerCase().includes(keyword))
      )
    }

    if (logs.length === 0) {
      return NextResponse.json(
        {
          count: 0,
          favoriteCount: 0,
          totalMinutes: 0,
          breakdown: [],
        },
        { status: 200 }
      )
    }

    const count = logs.length
    const favoriteCount = logs.filter((log) => log.favorite).length
    const totalMinutes = logs.reduce((sum, log) => sum + log.minutesRead, 0)

    // Compute breakdown per genre present
    const map = new Map<string, { count: number; total: number }>()
    for (const log of logs) {
      const current = map.get(log.genre) || { count: 0, total: 0 }
      map.set(log.genre, {
        count: current.count + 1,
        total: current.total + log.minutesRead,
      })
    }

    const breakdown = Array.from(map.entries()).map(([g, val]) => ({
      genre: g,
      count: val.count,
      total: val.total,
    }))

    // Order breakdown: total minutes descending; equal totals ordered Fiction, then Non-Fiction, then Sci-Fi, then Biography, then Other
    breakdown.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total
      }
      const indexA = GENRE_PRIORITY.indexOf(a.genre)
      const indexB = GENRE_PRIORITY.indexOf(b.genre)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })

    return NextResponse.json(
      {
        count,
        favoriteCount,
        totalMinutes,
        breakdown,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET reading-logs/summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

