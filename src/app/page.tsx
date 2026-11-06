import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Tag, Clock, ArrowRight, ShieldCheck, Heart, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-palette-100/40 via-slate-50 to-palette-200/25 relative overflow-hidden">
      
      {/* Decorative blurred background shapes */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-palette-200/40 to-palette-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl w-full text-center space-y-10 relative z-10">
        
        {/* Badge & Title */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-palette-200/80 text-palette-500 text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-palette-400 animate-pulse" />
            <span className="tracking-wide">Modern Reading Session Tracker</span>
          </div>

          <h1
            data-testid="home-title"
            className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Read<span className="bg-gradient-to-r from-palette-500 via-palette-400 to-palette-300 bg-clip-text text-transparent">Log</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Keep track of your daily reading habits: which book you read, how many minutes you spent, what genre it belongs to, and mark your favorite sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            asChild
            size="lg"
            data-testid="btn-register"
            className="bg-gradient-to-r from-palette-500 via-palette-500 to-palette-400 hover:opacity-95 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-palette-500/30 transition-all hover:scale-105 hover:shadow-palette-500/40"
          >
            <Link href="/register" className="flex items-center gap-2 text-base">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            data-testid="btn-login"
            className="border-palette-300 bg-white/80 backdrop-blur-sm text-palette-500 hover:bg-palette-100/60 hover:text-palette-500 font-bold px-8 h-12 rounded-xl shadow-sm text-base hover:border-palette-400 transition-all"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
          <Card className="border-palette-100/80 bg-white/85 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-6 h-6 text-palette-500" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">Log every session</CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Record book titles, minutes read, notes, and favorite highlights with complete date tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-palette-100/80 bg-white/85 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform duration-200">
                <Tag className="w-6 h-6 text-palette-500" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">Sort by genre</CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Categorize your sessions into Fiction, Non-Fiction, Sci-Fi, Biography, or Other.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-palette-100/80 bg-white/85 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-palette-300 hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
            <CardHeader className="p-6">
              <div className="w-12 h-12 rounded-xl bg-palette-100 text-palette-500 flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-6 h-6 text-palette-500" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">See minutes read</CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                View instant breakdowns of total minutes and session counts per genre dynamically.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

      </div>
    </main>
  )
}
