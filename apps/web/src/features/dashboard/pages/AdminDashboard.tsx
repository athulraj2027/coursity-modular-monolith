import React, { useState } from "react"
import {
  Activity,
  Check,
  DollarSign,
  Server,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react"

interface TeacherApplicant {
  id: string
  name: string
  email: string
  specialization: string
  experience: string
  github: string
  appliedDate: string
}

export const AdminDashboardPage: React.FC = () => {
  const [applicants] = useState<TeacherApplicant[]>([
    {
      id: "1",
      name: "Marcus Vance",
      email: "marcus@vance.io",
      specialization: "Distributed Consensus (Raft/Paxos)",
      experience: "Ex-Google Staff SRE (8 yrs)",
      github: "github.com/marcusvance",
      appliedDate: "2 hours ago",
    },
    {
      id: "2",
      name: "Elena Rostova",
      email: "elena@neural.ai",
      specialization: "AI Agents & Autonomous Eval",
      experience: "PhD Stanford / Anthropic Contributor",
      github: "github.com/erostova",
      appliedDate: "5 hours ago",
    },
    {
      id: "3",
      name: "David K. Chen",
      email: "david@chen.dev",
      specialization: "Cloud Native Rust Microservices",
      experience: "Principal Engineer at Datadog",
      github: "github.com/davidkchen",
      appliedDate: "1 day ago",
    },
  ])

  const [processedIds, setProcessedIds] = useState<Record<string, "approved" | "rejected">>({})

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setProcessedIds((prev) => ({ ...prev, [id]: action }))
  }

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
            <ShieldCheck className="w-3.5 h-3.5" />
            Root Administrative Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Platform Control Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Monitor system clusters, review incoming instructor applications, and manage platform safety across all cohorts.
          </p>
        </div>
      </div>

      {/* Platform Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Platform Monthly GMV",
            value: "$428,500",
            change: "+24.5% MoM Growth",
            icon: DollarSign,
          },
          {
            title: "Total Active Users",
            value: "52,480",
            change: "+3,210 this month",
            icon: Users,
          },
          {
            title: "Node Cluster Health",
            value: "99.98%",
            change: "24 / 24 pods operational",
            icon: Server,
          },
          {
            title: "Pending Teacher Apps",
            value: "5 Pending",
            change: "3 awaiting verification",
            icon: UserCheck,
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

      {/* Teacher Verification Queue & Telemetry Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Verification Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#F42A18]" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Instructor Verification Queue
              </h3>
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              {applicants.length} Applications Total
            </span>
          </div>

          <div className="space-y-3">
            {applicants.map((app) => {
              const status = processedIds[app.id]

              return (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {app.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                        {app.email}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="font-semibold text-[#F42A18]">Domain:</span> {app.specialization}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {app.experience} • Applied {app.appliedDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {status === "approved" ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    ) : status === "rejected" ? (
                      <span className="px-3 py-1.5 rounded-lg bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 text-xs font-semibold flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(app.id, "approved")}
                          className="px-3 py-1.5 rounded-lg bg-[#F42A18] text-white text-xs font-semibold hover:bg-[#d92211] transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(app.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Platform Telemetry & Live Health Nodes */}
        <div className="space-y-6 flex flex-col">
          {/* Telemetry Card */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F42A18]" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Live Cluster Telemetry
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400">WebSocket Connections</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">14,280 Live</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400">AI Code Evaluator Pods</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">16/16 Healthy</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400">Redis Cache Hit Ratio</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">98.6%</span>
              </div>
            </div>
          </div>

          {/* Security & Audit Alerts */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F42A18]" />
                Security Logs
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                All Normal
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Zero unauthorized access attempts in past 24h. TLS 1.3 enforced across all WebSocket endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
