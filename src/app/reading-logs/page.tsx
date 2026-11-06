"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadingLogProvider, useReadingLogs, ReadingLog } from "@/context/ReadingLogContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, Trash2, BookOpen, Clock, Tag, Calendar, Search, RotateCcw, Sparkles, PlusCircle, Bookmark, CheckCircle2 } from "lucide-react"

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
    <div data-testid="reading-logs-page" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-palette-500 via-palette-500 to-palette-400 p-6 sm:p-8 text-white shadow-lg shadow-palette-500/20">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-palette-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Reading Sessions
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl font-normal">
            Track and monitor your daily reading journey, build consistency, and highlight memorable books.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (lg: 5 cols): Add Form & Summary Widgets */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Session Form Card */}
          <Card className="border border-palette-100/90 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-palette-100/30 to-transparent pb-4 border-b border-palette-100/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-palette-100 text-palette-500 flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4 text-palette-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Add Reading Session
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Enter the details of your recent reading
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <form onSubmit={handleFormSubmit} noValidate data-testid="reading-log-form" className="space-y-4">
                
                {/* Success Message */}
                {formSuccess && (
                  <div
                    data-testid="reading-log-success"
                    className="p-3 text-sm rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2 shadow-sm animate-in fade-in"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Reading session added</span>
                  </div>
                )}

                {/* API Error Message */}
                {formErrors.apiError && (
                  <div
                    data-testid="error-reading-log"
                    className="p-3 text-sm rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold shadow-sm animate-in fade-in"
                  >
                    {formErrors.apiError}
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="bookTitle" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Book Title
                  </Label>
                  <Input
                    id="bookTitle"
                    type="text"
                    placeholder="e.g. Atomic Habits"
                    value={bookTitle}
                    onChange={handleTitleChange}
                    data-testid="input-book-title"
                    className={`rounded-xl h-10 ${formErrors.bookTitle ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-palette-400"}`}
                  />
                  {formErrors.bookTitle && (
                    <p data-testid="error-book-title" className="text-xs text-red-500 font-semibold mt-1">
                      {formErrors.bookTitle}
                    </p>
                  )}
                </div>

                {/* Minutes Read & Genre Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Minutes Read */}
                  <div className="space-y-1.5">
                    <Label htmlFor="minutesRead" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Minutes Read
                    </Label>
                    <Input
                      id="minutesRead"
                      type="number"
                      placeholder="e.g. 45"
                      value={minutesRead}
                      onChange={handleMinutesChange}
                      data-testid="input-minutes"
                      className={`rounded-xl h-10 ${formErrors.minutesRead ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-palette-400"}`}
                    />
                    {formErrors.minutesRead && (
                      <p data-testid="error-minutes" className="text-xs text-red-500 font-semibold mt-1">
                        {formErrors.minutesRead}
                      </p>
                    )}
                  </div>

                  {/* Genre */}
                  <div className="space-y-1.5">
                    <Label htmlFor="genre" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Genre
                    </Label>
                    <select
                      id="genre"
                      value={genre}
                      onChange={handleGenreChange}
                      data-testid="input-genre"
                      className={`flex h-10 w-full rounded-xl border bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-400 ${
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
                      <p data-testid="error-genre" className="text-xs text-red-500 font-semibold mt-1">
                        {formErrors.genre}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="readOn" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Date
                  </Label>
                  <Input
                    id="readOn"
                    type="date"
                    value={readOn}
                    onChange={handleDateChange}
                    data-testid="input-date"
                    className={`rounded-xl h-10 ${formErrors.readOn ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-palette-400"}`}
                  />
                  {formErrors.readOn && (
                    <p data-testid="error-date" className="text-xs text-red-500 font-semibold mt-1">
                      {formErrors.readOn}
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="note" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Note <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </Label>
                  <Input
                    id="note"
                    type="text"
                    placeholder="Chapter, key takeaway or notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    data-testid="input-note"
                    className="rounded-xl h-10 border-slate-200 focus-visible:ring-palette-400"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  data-testid="btn-add-reading-log"
                  className="w-full bg-gradient-to-r from-palette-500 to-palette-400 hover:opacity-95 text-white font-bold h-11 rounded-xl shadow-md shadow-palette-500/20 hover:shadow-palette-500/30 transition-all mt-2"
                >
                  {submitting ? "Adding session..." : "Add Reading Session"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Session Summary Card */}
          <Card className="border border-palette-100/90 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-b from-slate-50 to-transparent pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-palette-400" />
                Live Spending / Reading Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              
              {/* 3 Metric Badges */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-gradient-to-b from-palette-100/40 to-palette-100/20 rounded-xl border border-palette-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sessions</span>
                  <span data-testid="reading-log-count" className="text-2xl sm:text-3xl font-black text-palette-500 block mt-0.5">
                    {summary.count}
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-b from-amber-50 to-amber-100/20 rounded-xl border border-amber-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Favorites</span>
                  <span data-testid="favorite-count" className="text-2xl sm:text-3xl font-black text-amber-600 block mt-0.5">
                    {summary.favoriteCount}
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-b from-purple-50 to-purple-100/20 rounded-xl border border-purple-200/60 shadow-xs">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Total Mins</span>
                  <span data-testid="total-minutes" className="text-2xl sm:text-3xl font-black text-purple-900 block mt-0.5">
                    {summary.totalMinutes}
                  </span>
                </div>
              </div>

              {/* Genre Breakdown List */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Genre Breakdown
                </span>
                
                <div data-testid="genre-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No breakdown data for currently filtered sessions.
                    </div>
                  ) : (
                    summary.breakdown.map((item) => (
                      <div
                        key={item.genre}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-palette-400" />
                          <span data-testid="breakdown-name" className="font-bold text-slate-800">
                            {item.genre}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-medium">
                            <span data-testid="breakdown-count" className="font-bold text-slate-700">
                              {item.count}
                            </span>{" "}
                            {item.count === 1 ? "session" : "sessions"}
                          </span>
                          
                          <span className="bg-palette-100/80 text-palette-500 px-2.5 py-0.5 rounded-full font-extrabold border border-palette-200/60">
                            <span data-testid="breakdown-total">{item.total}</span> mins
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

        {/* Right Column (lg: 7 cols): Filter Toolbar & Reading Sessions List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Enhanced Filter Toolbar */}
          <Card className="border border-palette-100/90 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    placeholder="Search by title or note..."
                    value={filters.q}
                    onChange={handleSearchChange}
                    data-testid="search-input"
                    className="pl-10 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-palette-400"
                  />
                </div>

                {/* Genre Select Filter */}
                <div className="w-full sm:w-44">
                  <select
                    value={filters.genre}
                    onChange={handleFilterGenreChange}
                    data-testid="filter-genre"
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-400"
                  >
                    <option value="">All</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Favorites Only Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap px-1 py-2">
                  <input
                    type="checkbox"
                    checked={filters.favorite}
                    onChange={handleFilterFavoriteChange}
                    data-testid="filter-favorite"
                    className="rounded border-slate-300 text-palette-500 focus:ring-palette-400 w-4 h-4 cursor-pointer accent-palette-500"
                  />
                  <span>Favorites only</span>
                </label>

                {/* Clear Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="btn-clear-filters"
                  className="h-10 px-3.5 text-xs font-semibold rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List or Empty State */}
          {logs.length === 0 ? (
            <div
              data-testid="reading-logs-empty"
              className="p-16 text-center bg-white rounded-2xl border border-palette-100/90 shadow-sm text-base font-semibold text-slate-500 space-y-2"
            >
              <div className="w-16 h-16 rounded-full bg-palette-100/40 text-palette-400 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-8 h-8 opacity-60" />
              </div>
              <p>No reading sessions found</p>
            </div>
          ) : (
            <div data-testid="reading-log-list" className="space-y-3.5">
              {logs.map((log: ReadingLog) => (
                <div
                  key={log.id}
                  data-testid="reading-log-item"
                  className="p-5 bg-white rounded-2xl border border-palette-100/90 shadow-sm hover:shadow-md hover:border-palette-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left content: Title, Genre, Minutes, Date, Note */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        data-testid="reading-log-title"
                        className="font-extrabold text-lg text-slate-900 tracking-tight truncate group-hover:text-palette-500 transition-colors"
                      >
                        {log.bookTitle}
                      </h3>
                      
                      <span
                        data-testid="reading-log-genre"
                        className="px-3 py-0.5 rounded-full text-xs font-bold bg-palette-100/80 text-palette-500 border border-palette-200/70 shadow-xs"
                      >
                        {log.genre}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1.5 font-bold text-palette-500 bg-palette-100/40 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-palette-400" />
                        <span>
                          <span data-testid="reading-log-minutes">{log.minutesRead}</span> mins
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span data-testid="reading-log-date">{log.readOn}</span>
                      </div>
                    </div>

                    {log.note && (
                      <p className="text-xs text-slate-600 italic bg-slate-50/90 px-3 py-1.5 rounded-lg border border-slate-100 mt-1 max-w-xl">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right actions: Favorite Toggle & Delete Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      data-testid="btn-toggle-favorite"
                      aria-pressed={log.favorite ? "true" : "false"}
                      onClick={() => toggleFavorite(log.id, log.favorite)}
                      className={`p-2.5 rounded-xl border transition-all duration-150 active:scale-90 ${
                        log.favorite
                          ? "bg-amber-50 border-amber-300 text-amber-500 shadow-xs hover:bg-amber-100"
                          : "bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                      title={log.favorite ? "Unmark favorite" : "Mark as favorite"}
                    >
                      <Star className={`w-4 h-4 transition-transform ${log.favorite ? "fill-amber-400 scale-110" : ""}`} />
                    </button>

                    <button
                      type="button"
                      data-testid="btn-delete-reading-log"
                      onClick={() => deleteLog(log.id)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-150 active:scale-90"
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
          window.dispatchEvent(new Event("auth-change"))
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
