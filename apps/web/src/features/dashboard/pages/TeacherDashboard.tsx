import React from "react"
import {
  Bot,
  CheckCircle2,
  DollarSign,
  FileCode,
  GraduationCap,
  Plus,
  Radio,
  ScreenShare,
  Star,
  Users,
} from "lucide-react"

export const TeacherDashboardPage: React.FC = () => {
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
            <GraduationCap className="w-3.5 h-3.5" />
            Verified Creator & Mentor
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Creator Studio Hub
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Track learner engagement, manage AI automated evaluation rubrics, and host interactive live coding cohorts.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Monthly Revenue",
            value: "$8,540.00",
            change: "+18.4% vs last month",
            icon: DollarSign,
          },
          {
            title: "Active Students",
            value: "1,420",
            change: "+114 enrolled this week",
            icon: Users,
          },
          {
            title: "Course Completion",
            value: "94.2%",
            change: "+2.1% platform avg",
            icon: CheckCircle2,
          },
          {
            title: "Creator Rating",
            value: "4.92 / 5.0",
            change: "284 learner reviews",
            icon: Star,
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

      {/* Curriculum Tracks & Live Host Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Created Tracks */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#F42A18]" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Published Tracks & Cohorts
              </h3>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#F42A18] text-white text-xs font-semibold hover:bg-[#d92211] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Track</span>
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Advanced Distributed Systems in Go",
                enrolled: 840,
                revenue: "$4,200",
                status: "Published",
              },
              {
                name: "Autonomous AI Agents Architecture",
                enrolled: 460,
                revenue: "$2,850",
                status: "Published",
              },
              {
                name: "Rust WebAssembly Cloud Microservices",
                enrolled: 120,
                revenue: "$1,490",
                status: "Drafting",
              },
            ].map((course, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[#F42A18]/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-[#F42A18] transition-colors">
                      {course.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        course.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{course.enrolled} active students</span>
                    <span>•</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {course.revenue} earned
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    Edit Curriculum
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Grading Queue & Live Broadcast Host */}
        <div className="space-y-6 flex flex-col">
          {/* Live Host Controller */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ScreenShare className="w-4 h-4 text-[#F42A18]" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Live Cohort Broadcast
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Start your scheduled live lecture or launch an interactive pair programming studio.
            </p>
            <div className="p-3.5 rounded-xl bg-[#F42A18]/5 border border-[#F42A18]/15 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#F42A18]">
                <span>Next Class: 4:00 PM</span>
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#F42A18] animate-pulse" />
                  Ready
                </span>
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Topic: Building Raft State Machine
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-[#F42A18] text-white text-xs font-semibold hover:bg-[#d92211] transition-colors shadow-md shadow-[#F42A18]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <ScreenShare className="w-3.5 h-3.5" />
              Go Live (Host Studio)
            </button>
          </div>

          {/* AI Grading & Submission Queue */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#F42A18]" />
                AI Evaluation Queue
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                14 Pending
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              AI has scored 14 projects. Review edge cases and release cohort grades.
            </p>
            <button
              type="button"
              className="w-full py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              Review AI Grading Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboardPage
