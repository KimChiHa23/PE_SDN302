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

  const toggleFavorite = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !currentVal }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (e) {
      console.error("Error toggling favorite:", e)
    }
  }

  const deleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (e) {
      console.error("Error deleting log:", e)
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

