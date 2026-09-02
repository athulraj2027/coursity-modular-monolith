import React from "react"
import {
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Radio,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Play,
} from "lucide-react"

export const StudentDashboardPage: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 text-left shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#F42A18]/10 blur-3xl"
        />
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
            <Flame className="w-3.5 h-3.5" />
            Day 14 Continuous Streak
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back, Alex!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            You're 68% through the Distributed Systems track. Next live coding cohort session starts at 6:00 PM today.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Hours Learned",
            value: "38.5h",
            change: "+4.2h this week",
            icon: TrendingUp,
          },
          {
            title: "Projects Built",
            value: "6 / 8",
            change: "2 left in track",
            icon: CheckCircle2,
          },
          {
            title: "Next Live Cohort",
            value: "Today, 6 PM",
            change: "Raft Consensus",
            icon: Radio,
          },
          {
            title: "AI Assessment Score",
            value: "96 / 100",
            change: "Top 5% percentile",
            icon: Sparkles,
          },
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#F42A18]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {metric.title}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {metric.change}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Tracks & AI Lab Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tracks List */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F42A18]" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Active Engineering Tracks
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#F42A18] hover:underline cursor-pointer flex items-center gap-1">
              <span>Browse Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Distributed Systems & Raft Consensus",
                progress: 68,
                tag: "Go / Systems",
                time: "4 lessons left",
              },
              {
                name: "Production AI Agents & LLM Orchestration",
                progress: 42,
                tag: "Python / AI",
                time: "8 lessons left",
              },
              {
                name: "Full-Stack Next.js 15 Cloud Native",
                progress: 90,
                tag: "TypeScript",
                time: "1 lesson left",
              },
            ].map((track, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[#F42A18]/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-[#F42A18] transition-colors">
                      {track.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                      {track.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{track.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-32 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F42A18] h-full rounded-full transition-all"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 w-9 text-right">
                    {track.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Sandbox & Live Cohort Widget */}
        <div className="space-y-6 flex flex-col">
          {/* AI Code Reviewer Widget */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4 flex flex-col justify-between flex-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  AI Code Reviewer
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Run your latest project implementation against automated test suites with instant architectural feedback.
              </p>
              <div className="p-3.5 rounded-xl bg-[#F42A18]/5 border border-[#F42A18]/15 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#F42A18]">
                  <span>Last Test Suite</span>
                  <span>100% Passed</span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                  Raft Leader Election: passed in 18ms
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-[#F42A18] text-white text-xs font-semibold hover:bg-[#d92211] transition-colors shadow-md shadow-[#F42A18]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Brain className="w-3.5 h-3.5" />
              Launch AI Assessment
            </button>
          </div>

          {/* Upcoming Live Session Card */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F42A18] flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse" />
                Starting Soon
              </span>
              <span className="text-xs text-neutral-400">6:00 PM EST</span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Live Lab: Distributed Mutexes & Locks
            </h4>
            <button
              type="button"
              className="w-full py-2 rounded-lg border border-[#F42A18]/30 bg-[#F42A18]/10 text-[#F42A18] text-xs font-semibold hover:bg-[#F42A18] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              Join Live Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboardPage
