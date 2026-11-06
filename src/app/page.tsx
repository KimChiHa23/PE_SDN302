import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Tag, Clock, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 bg-gradient-to-b from-white via-palette-100/20 to-palette-200/30">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        {/* Badge & Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-palette-100 border border-palette-200 text-palette-500 text-xs sm:text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4 text-palette-400" />
            <span>Smart Personal Reading Session Tracker</span>
          </div>

          <h1
            data-testid="home-title"
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900"
          >
            Read<span className="text-palette-500">Log</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Keep track of your daily reading habits: which book you read, how many minutes you spent, what genre it belongs to, and mark your favorite sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            asChild
            size="lg"
            data-testid="btn-register"
            className="bg-palette-500 hover:bg-palette-400 text-white font-medium px-8 shadow-lg shadow-palette-500/25 transition-all hover:scale-105"
          >
            <Link href="/register" className="flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            data-testid="btn-login"
            className="border-palette-300 text-palette-500 hover:bg-palette-100 hover:text-palette-500 font-medium px-8"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
          <Card className="border-palette-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Log every session</CardTitle>
              <CardDescription className="text-slate-500">
                Record book titles, minutes read, notes, and favorite highlights with complete date tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-palette-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-2">
                <Tag className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Sort by genre</CardTitle>
              <CardDescription className="text-slate-500">
                Categorize your sessions into Fiction, Non-Fiction, Sci-Fi, Biography, or Other.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-palette-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">See minutes read</CardTitle>
              <CardDescription className="text-slate-500">
                View instant breakdowns of total minutes and session counts per genre dynamically.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

      </div>
    </main>
  )
}
