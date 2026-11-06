"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadingLogProvider, useReadingLogs, ReadingLog } from "@/context/ReadingLogContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Trash2, BookOpen, Clock, Tag, Calendar, Search, RotateCcw } from "lucide-react"

const GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"]

function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function ReadingLogsContent() {
  const {
    logs,
    summary,
    filters,
    setFilters,
    fetchData,
    addLog,
    toggleFavorite,
    deleteLog,
    clearFilters,
  } = useReadingLogs()

  // Form states
  const [bookTitle, setBookTitle] = useState("")
  const [minutesRead, setMinutesRead] = useState("")
  const [genre, setGenre] = useState("")
  const [note, setNote] = useState("")
  const [readOn, setReadOn] = useState("")

  const [formErrors, setFormErrors] = useState<{
    bookTitle?: string
    minutesRead?: string
    genre?: string
    readOn?: string
    apiError?: string
  }>({})

  const [formSuccess, setFormSuccess] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Validation functions
  const validateTitle = (val: string) => {
    if (!val || !val.trim()) return "Book title is required"
    if (val.length > 80) return "Book title must be at most 80 characters"
    return undefined
  }

  const validateMinutes = (val: string) => {
    if (val === undefined || val === null || val === "" || !val.trim()) {
      return "Minutes read is required"
    }
    const num = Number(val)
    if (isNaN(num)) return "Minutes read is required"
    if (num <= 0) return "Minutes read must be a positive number"
    return undefined
  }

  const validateGenre = (val: string) => {
    if (!val || !val.trim()) return "Please choose a genre"
    if (!GENRES.includes(val)) return "Invalid genre"
    return undefined
  }

  const validateDate = (val: string) => {
    if (!val || !val.trim()) return "Date is required"
    const today = getTodayString()
    if (val > today) return "Date cannot be in the future"
    return undefined
  }

  // Field change handlers (clear errors when valid)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setBookTitle(val)
    if (formSubmitted) {
      setFormErrors((prev) => ({
        ...prev,
        bookTitle: validateTitle(val),
        apiError: undefined,
      }))
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMinutesRead(val)
    if (formSubmitted) {
      setFormErrors((prev) => ({
        ...prev,
        minutesRead: validateMinutes(val),
        apiError: undefined,
      }))
    }
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setGenre(val)
    if (formSubmitted) {
      setFormErrors((prev) => ({
        ...prev,
        genre: validateGenre(val),
        apiError: undefined,
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setReadOn(val)
    if (formSubmitted) {
      setFormErrors((prev) => ({
        ...prev,
        readOn: validateDate(val),
        apiError: undefined,
      }))
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setFormSuccess(false)

    const titleErr = validateTitle(bookTitle)
    const minutesErr = validateMinutes(minutesRead)
    const genreErr = validateGenre(genre)
    const dateErr = validateDate(readOn)

    if (titleErr || minutesErr || genreErr || dateErr) {
      setFormErrors({
        bookTitle: titleErr,
        minutesRead: minutesErr,
        genre: genreErr,
        readOn: dateErr,
      })
      return
    }

    setFormErrors({})
    setSubmitting(true)

    const res = await addLog({
      bookTitle: bookTitle.trim(),
      minutesRead: Number(minutesRead),
      genre,
      note,
      readOn,
    })

    setSubmitting(false)

    if (!res.success) {
      setFormErrors({ apiError: res.error })
    } else {
      setFormSuccess(true)
      setBookTitle("")
      setMinutesRead("")
      setGenre("")
      setNote("")
      setReadOn("")
      setFormSubmitted(false)
    }
  }

  // Filter change handlers
  const handleFilterGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, genre: e.target.value }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  const handleFilterFavoriteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, favorite: e.target.checked }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, q: e.target.value }
    setFilters(newFilters)
    fetchData(newFilters)
  }

  return (
    <div data-testid="reading-logs-page" className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-palette-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Reading Sessions
          </h1>
          <p className="text-slate-500 mt-1">
            Track and monitor your daily reading journey and habit consistency.
          </p>
        </div>
      </div>

      {/* Main Grid: Left (Form & Summary), Right (Filters & List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (lg: 5 cols): Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Session Form */}
          <Card className="border-palette-100 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-palette-500" />
                Add Reading Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} noValidate data-testid="reading-log-form" className="space-y-4">
                
                {/* Messages */}
                {formSuccess && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium"
                  >
                    Reading session added
                  </div>
                )}

                {formErrors.apiError && (
                  <div
                    data-testid="error-reading-log"
                    className="p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-600 font-medium"
                  >
                    {formErrors.apiError}
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1">
                  <Label htmlFor="bookTitle" className="text-slate-700 font-medium text-xs">
                    Book Title
                  </Label>
                  <Input
                    id="bookTitle"
                    type="text"
                    placeholder="e.g. Atomic Habits"
                    value={bookTitle}
                    onChange={handleTitleChange}
                    data-testid="input-book-title"
                    className={formErrors.bookTitle ? "border-red-500" : "border-slate-200"}
                  />
                  {formErrors.bookTitle && (
                    <p data-testid="error-book-title" className="text-xs text-red-500 font-medium mt-1">
                      {formErrors.bookTitle}
                    </p>
                  )}
                </div>

                {/* Minutes Read & Genre Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Minutes Read */}
                  <div className="space-y-1">
                    <Label htmlFor="minutesRead" className="text-slate-700 font-medium text-xs">
                      Minutes Read
                    </Label>
                    <Input
                      id="minutesRead"
                      type="number"
                      placeholder="e.g. 45"
                      value={minutesRead}
                      onChange={handleMinutesChange}
                      data-testid="input-minutes"
                      className={formErrors.minutesRead ? "border-red-500" : "border-slate-200"}
                    />
                    {formErrors.minutesRead && (
                      <p data-testid="error-minutes" className="text-xs text-red-500 font-medium mt-1">
                        {formErrors.minutesRead}
                      </p>
                    )}
                  </div>

                  {/* Genre */}
                  <div className="space-y-1">
                    <Label htmlFor="genre" className="text-slate-700 font-medium text-xs">
                      Genre
                    </Label>
                    <select
                      id="genre"
                      value={genre}
                      onChange={handleGenreChange}
                      data-testid="input-genre"
                      className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-palette-400 ${
                        formErrors.genre ? "border-red-500" : "border-slate-200"
                      }`}
                    >
                      <option value="">Choose genre</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    {formErrors.genre && (
                      <p data-testid="error-genre" className="text-xs text-red-500 font-medium mt-1">
                        {formErrors.genre}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="readOn" className="text-slate-700 font-medium text-xs">
                    Date
                  </Label>
                  <Input
                    id="readOn"
                    type="date"
                    value={readOn}
                    onChange={handleDateChange}
                    data-testid="input-date"
                    className={formErrors.readOn ? "border-red-500" : "border-slate-200"}
                  />
                  {formErrors.readOn && (
                    <p data-testid="error-date" className="text-xs text-red-500 font-medium mt-1">
                      {formErrors.readOn}
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <Label htmlFor="note" className="text-slate-700 font-medium text-xs">
                    Note (optional)
                  </Label>
                  <Input
                    id="note"
                    type="text"
                    placeholder="Chapter, key takeaway or notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    data-testid="input-note"
                    className="border-slate-200"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  data-testid="btn-add-reading-log"
                  className="w-full bg-palette-500 hover:bg-palette-400 text-white font-medium py-2 rounded-lg shadow-md shadow-palette-500/20"
                >
                  {submitting ? "Adding..." : "Add Reading Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Box */}
          <Card className="border-palette-100 shadow-md bg-white">
            <CardHeader className="pb-3 border-b border-palette-100/60">
              <CardTitle className="text-lg font-bold text-slate-800">
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {/* Counts Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-palette-100/40 rounded-xl border border-palette-200/50">
                  <span className="text-xs text-slate-500 block font-medium">Sessions</span>
                  <span data-testid="reading-log-count" className="text-2xl font-extrabold text-palette-500">
                    {summary.count}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                  <span className="text-xs text-amber-700 block font-medium">Favorites</span>
                  <span data-testid="favorite-count" className="text-2xl font-extrabold text-amber-600">
                    {summary.favoriteCount}
                  </span>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/60">
                  <span className="text-xs text-purple-700 block font-medium">Minutes</span>
                  <span data-testid="total-minutes" className="text-2xl font-extrabold text-purple-800">
                    {summary.totalMinutes}
                  </span>
                </div>
              </div>

              {/* Genre Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Genre Breakdown
                </span>
                <div data-testid="genre-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No genre data for current filter.</p>
                  ) : (
                    summary.breakdown.map((item) => (
                      <div
                        key={item.genre}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <span data-testid="breakdown-name" className="font-semibold text-slate-800">
                          {item.genre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            <span data-testid="breakdown-count" className="font-semibold text-slate-700">
                              {item.count}
                            </span>{" "}
                            {item.count === 1 ? "session" : "sessions"}
                          </span>
                          <span className="bg-palette-100 text-palette-500 px-2 py-0.5 rounded-full font-bold">
                            <span data-testid="breakdown-total">{item.total}</span> min
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (lg: 7 cols): Filters & List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Filters Bar */}
          <Card className="border-palette-100 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    placeholder="Search by title or note..."
                    value={filters.q}
                    onChange={handleSearchChange}
                    data-testid="search-input"
                    className="pl-9 h-9 text-xs border-slate-200"
                  />
                </div>

                {/* Genre Select */}
                <div className="w-full sm:w-40">
                  <select
                    value={filters.genre}
                    onChange={handleFilterGenreChange}
                    data-testid="filter-genre"
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-palette-400"
                  >
                    <option value="">All</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Favorite Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 whitespace-nowrap px-1">
                  <input
                    type="checkbox"
                    checked={filters.favorite}
                    onChange={handleFilterFavoriteChange}
                    data-testid="filter-favorite"
                    className="rounded border-slate-300 text-palette-500 focus:ring-palette-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Favorites only</span>
                </label>

                {/* Clear Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="btn-clear-filters"
                  className="h-9 px-3 text-xs border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List or Empty State */}
          {logs.length === 0 ? (
            <div
              data-testid="reading-logs-empty"
              className="p-12 text-center bg-white rounded-xl border border-palette-100 shadow-sm text-base font-semibold text-slate-600"
            >
              No reading sessions found
            </div>
          ) : (
            <div data-testid="reading-log-list" className="space-y-3">
              {logs.map((log: ReadingLog) => (
                <div
                  key={log.id}
                  data-testid="reading-log-item"
                  className="p-4 bg-white rounded-xl border border-palette-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Book title, Genre, Date, Note */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        data-testid="reading-log-title"
                        className="font-bold text-base text-slate-900 truncate"
                      >
                        {log.bookTitle}
                      </h3>
                      <span
                        data-testid="reading-log-genre"
                        className="px-2 py-0.5 rounded-full text-xs font-semibold bg-palette-100 text-palette-500 border border-palette-200"
                      >
                        {log.genre}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1 font-semibold text-palette-500">
                        <Clock className="w-3.5 h-3.5 text-palette-400" />
                        <span>
                          <span data-testid="reading-log-minutes">{log.minutesRead}</span> mins
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span data-testid="reading-log-date">{log.readOn}</span>
                      </div>
                    </div>

                    {log.note && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right: Favorite Toggle & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      data-testid="btn-toggle-favorite"
                      aria-pressed={log.favorite ? "true" : "false"}
                      onClick={() => toggleFavorite(log.id, log.favorite)}
                      className={`p-2 rounded-lg border transition-all ${
                        log.favorite
                          ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100"
                          : "bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                      }`}
                      title={log.favorite ? "Unmark favorite" : "Mark as favorite"}
                    >
                      <Star className={`w-4 h-4 ${log.favorite ? "fill-amber-400" : ""}`} />
                    </button>

                    <button
                      type="button"
                      data-testid="btn-delete-reading-log"
                      onClick={() => deleteLog(log.id)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function ReadingLogsPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login")
        } else {
          setAuthChecked(true)
        }
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

  // "While the app is still finding out whether someone is logged in, nothing from this page is shown (no flash of content, no wrong redirect)."
  if (!authChecked) {
    return null
  }

  return (
    <ReadingLogProvider>
      <ReadingLogsContent />
    </ReadingLogProvider>
  )
}

