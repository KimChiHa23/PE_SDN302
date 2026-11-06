"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface ReadingLog {
  id: string
  bookTitle: string
  minutesRead: number
  genre: string
  note?: string | null
  favorite: boolean
  readOn: string
  createdAt: string
}

export interface GenreBreakdown {
  genre: string
  count: number
  total: number
}

export interface ReadingSummary {
  count: number
  favoriteCount: number
  totalMinutes: number
  breakdown: GenreBreakdown[]
}

interface FilterState {
  genre: string
  favorite: boolean
  q: string
}

interface ReadingLogContextType {
  logs: ReadingLog[]
  summary: ReadingSummary
  filters: FilterState
  loading: boolean
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  fetchData: (customFilters?: FilterState) => Promise<void>
  addLog: (data: any) => Promise<{ success: boolean; error?: string }>
  toggleFavorite: (id: string, currentVal: boolean) => Promise<void>
  deleteLog: (id: string) => Promise<void>
  clearFilters: () => void
  resetAll: () => void
}

const defaultSummary: ReadingSummary = {
  count: 0,
  favoriteCount: 0,
  totalMinutes: 0,
  breakdown: [],
}

const defaultFilters: FilterState = {
  genre: "",
  favorite: false,
  q: "",
}

const ReadingLogContext = createContext<ReadingLogContextType | undefined>(undefined)

export function ReadingLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ReadingLog[]>([])
  const [summary, setSummary] = useState<ReadingSummary>(defaultSummary)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (customFilters?: FilterState) => {
    const f = customFilters || filters
    const query = new URLSearchParams()
    if (f.genre && f.genre !== "All") query.set("genre", f.genre)
    if (f.favorite) query.set("favorite", "true")
    if (f.q && f.q.trim()) query.set("q", f.q.trim())

    const queryString = query.toString() ? `?${query.toString()}` : ""

    try {
      const [logsRes, sumRes] = await Promise.all([
        fetch(`/api/reading-logs${queryString}`),
        fetch(`/api/reading-logs/summary${queryString}`),
      ])

      if (logsRes.ok && sumRes.ok) {
        const logsData = await logsRes.json()
        const sumData = await sumRes.json()
        setLogs(logsData)
        setSummary(sumData)
      }
    } catch (e) {
      console.error("Error fetching reading logs:", e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addLog = async (data: any) => {
    try {
      const res = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        return { success: false, error: result.error || "Failed to add reading session" }
      }
      await fetchData()
      return { success: true }
    } catch {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Tối ưu phản hồi tức thì (Optimistic UI Update) - 0ms delay!
  const toggleFavorite = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal

    // 1. Cập nhật state màn hình ngay lập tức (0ms)
    setLogs((prev) => {
      if (filters.favorite && !newVal) {
        // Nếu "favorites only" đang bật và un-star -> biến mất khỏi list ngay lập tức
        return prev.filter((item) => item.id !== id)
      }
      return prev.map((item) => (item.id === id ? { ...item, favorite: newVal } : item))
    })

    setSummary((prev) => {
      const target = logs.find((l) => l.id === id)
      const isFilteredOut = filters.favorite && !newVal
      const newFavCount = newVal ? prev.favoriteCount + 1 : Math.max(0, prev.favoriteCount - 1)
      const newTotalCount = isFilteredOut ? Math.max(0, prev.count - 1) : prev.count
      const newTotalMinutes = isFilteredOut && target ? Math.max(0, prev.totalMinutes - target.minutesRead) : prev.totalMinutes

      return {
        ...prev,
        favoriteCount: newFavCount,
        count: newTotalCount,
        totalMinutes: newTotalMinutes,
      }
    })

    // 2. Gửi request PATCH ngầm ở background
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: newVal }),
      })
      if (!res.ok) {
        // Rollback nếu có lỗi
        await fetchData()
      } else {
        // Đồng bộ dữ liệu summary chính xác từ backend ngầm
        fetchData()
      }
    } catch {
      await fetchData()
    }
  }

  // Tối ưu phản hồi tức thì cho Delete (Optimistic Delete) - 0ms delay!
  const deleteLog = async (id: string) => {
    const target = logs.find((l) => l.id === id)

    // Cập nhật state ngay lập tức
    setLogs((prev) => prev.filter((item) => item.id !== id))
    if (target) {
      setSummary((prev) => ({
        ...prev,
        count: Math.max(0, prev.count - 1),
        favoriteCount: target.favorite ? Math.max(0, prev.favoriteCount - 1) : prev.favoriteCount,
        totalMinutes: Math.max(0, prev.totalMinutes - target.minutesRead),
      }))
    }

    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        await fetchData()
      } else {
        fetchData()
      }
    } catch {
      await fetchData()
    }
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    fetchData(defaultFilters)
  }

  const resetAll = () => {
    setLogs([])
    setSummary(defaultSummary)
    setFilters(defaultFilters)
    setLoading(true)
  }

  return (
    <ReadingLogContext.Provider
      value={{
        logs,
        summary,
        filters,
        loading,
        setFilters,
        fetchData,
        addLog,
        toggleFavorite,
        deleteLog,
        clearFilters,
        resetAll,
      }}
    >
      {children}
    </ReadingLogContext.Provider>
  )
}

export function useReadingLogs() {
  const context = useContext(ReadingLogContext)
  if (!context) {
    throw new Error("useReadingLogs must be used within a ReadingLogProvider")
  }
  return context
}
