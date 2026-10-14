import React, { useState, useMemo } from "react"
import { Users } from "lucide-react"
import type { UserGrowthTimeframePoint } from "../../types/user-management.types"

export type UserGrowthTimeframe = "7D" | "30D" | "90D" | "1Y"
export type UserRoleFilter = "all" | "students" | "teachers"

interface AdminUserGrowthChartProps {
  totalStudents?: number
  totalTeachers?: number
  verifiedTeachers?: number
  timeframeData?: {
    "7D": UserGrowthTimeframePoint[]
    "30D": UserGrowthTimeframePoint[]
    "90D": UserGrowthTimeframePoint[]
    "1Y": UserGrowthTimeframePoint[]
  }
  isLoading?: boolean
}

export const AdminUserGrowthChart: React.FC<AdminUserGrowthChartProps> = ({
  totalStudents = 1240,
  totalTeachers = 85,
  timeframeData,
  isLoading = false,
}) => {
  const [timeframe, setTimeframe] = useState<UserGrowthTimeframe>("30D")
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const data: UserGrowthTimeframePoint[] = useMemo(() => {
    if (timeframeData && timeframeData[timeframe] && timeframeData[timeframe].length > 0) {
      return timeframeData[timeframe]
    }

    const now = new Date()

    if (timeframe === "7D") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const sCounts = [14, 22, 28, 19, 31, 35, 20]
      const tCounts = [2, 3, 4, 1, 5, 4, 2]
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return {
          label: days[d.getDay()],
          date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          students: sCounts[i],
          teachers: tCounts[i],
        }
      })
    }

    if (timeframe === "30D") {
      return Array.from({ length: 10 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (9 - i) * 3)
        const sVal = 35 + Math.round(20 * Math.sin((i / 10) * Math.PI)) + (i * 3)
        const tVal = Math.max(1, Math.round(sVal * 0.12))
        return {
          label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
          students: sVal,
          teachers: tVal,
        }
      })
    }

    if (timeframe === "90D") {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (11 - i) * 7)
        const sVal = 70 + i * 12 + Math.round(15 * Math.cos(i))
        const tVal = Math.max(3, Math.round(sVal * 0.14))
        return {
          label: `Wk ${i + 1}`,
          date: `Week of ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
          students: sVal,
          teachers: tVal,
        }
      })
    }

    // 1Y (12 Months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonthIndex = now.getMonth()
    return Array.from({ length: 12 }, (_, i) => {
      const monthIdx = (currentMonthIndex - 11 + i + 12) % 12
      const sVal = 180 + i * 35 + Math.round(40 * Math.sin(i))
      const tVal = Math.max(10, Math.round(sVal * 0.15))
      return {
        label: months[monthIdx],
        date: `${months[monthIdx]} ${now.getFullYear() - (currentMonthIndex < 11 - i ? 1 : 0)}`,
        students: sVal,
        teachers: tVal,
      }
    })
  }, [timeframe, timeframeData])

  const totalLearnersInPeriod = useMemo(() => data.reduce((acc, d) => acc + d.students, 0), [data])
  const totalTeachersInPeriod = useMemo(() => data.reduce((acc, d) => acc + d.teachers, 0), [data])
  const combinedTotal = totalLearnersInPeriod + totalTeachersInPeriod

  const maxTotal = useMemo(() => {
    return Math.max(...data.map((d) => (roleFilter === "all" ? d.students + d.teachers : roleFilter === "students" ? d.students : d.teachers)), 10) * 1.2
  }, [data, roleFilter])

  // SVG Geometry
  const width = 500
  const height = 220
  const paddingLeft = 40
  const paddingRight = 16
  const paddingTop = 20
  const paddingBottom = 32

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const barWidth = Math.max(12, Math.min(28, (chartWidth / (data.length || 1)) * 0.65))

  const activeData = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1]

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4 text-left shadow-xs flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              User Acquisition & Signups
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real learner registrations vs. instructor onboarding intake.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-xs">
            {(
              [
                { key: "all", label: "All" },
                { key: "students", label: "Learners" },
                { key: "teachers", label: "Instructors" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === tab.key
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-xs">
            {(["7D", "30D", "90D", "1Y"] as UserGrowthTimeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-[#F42A18] text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Stat Summary */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
          <span className="text-[10px] text-neutral-500 block">Total In Period</span>
          <span className="text-base font-bold text-neutral-900 dark:text-white font-mono">
            {combinedTotal.toLocaleString()}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
          <span className="text-[10px] text-neutral-500 block">Total Learners</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
            {totalStudents.toLocaleString()}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
          <span className="text-[10px] text-neutral-500 block">Total Instructors</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {totalTeachers.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative w-full overflow-hidden select-none">
        {isLoading ? (
          <div className="w-full h-48 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 animate-pulse flex items-center justify-center text-xs text-neutral-400">
            Fetching user growth telemetry...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Y Axis Grid Lines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = paddingTop + chartHeight - pct * chartHeight
              const val = Math.round(maxTotal * pct)
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-800/80"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-neutral-400"
                  >
                    {val}
                  </text>
                </g>
              )
            })}

            {/* Render Stacked / Filtered Bars */}
            {data.map((d, idx) => {
              const x = paddingLeft + (idx / (data.length - 1 || 1)) * (chartWidth - barWidth)
              const isHovered = hoveredIndex === idx

              const studentHeight = (d.students / maxTotal) * chartHeight
              const teacherHeight = (d.teachers / maxTotal) * chartHeight

              const studentY = paddingTop + chartHeight - studentHeight
              const teacherY = paddingTop + chartHeight - (studentHeight + teacherHeight)

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  {/* Background hover highlight column */}
                  <rect
                    x={x - 4}
                    y={paddingTop}
                    width={barWidth + 8}
                    height={chartHeight}
                    fill={isHovered ? "currentColor" : "transparent"}
                    className="text-neutral-100 dark:text-neutral-800/40 transition-colors"
                    rx="4"
                  />

                  {/* Role Filter: All (Stacked) */}
                  {roleFilter === "all" && (
                    <>
                      {/* Student Bar (Bottom) */}
                      <rect
                        x={x}
                        y={studentY}
                        width={barWidth}
                        height={studentHeight}
                        fill="#3B82F6"
                        rx="3"
                        className="transition-all duration-300"
                        opacity={isHovered ? 1 : 0.85}
                      />
                      {/* Teacher Bar (Stacked Top) */}
                      <rect
                        x={x}
                        y={teacherY}
                        width={barWidth}
                        height={teacherHeight}
                        fill="#10B981"
                        rx="3"
                        className="transition-all duration-300"
                        opacity={isHovered ? 1 : 0.85}
                      />
                    </>
                  )}

                  {/* Role Filter: Students Only */}
                  {roleFilter === "students" && (
                    <rect
                      x={x}
                      y={studentY}
                      width={barWidth}
                      height={studentHeight}
                      fill="#3B82F6"
                      rx="3"
                      className="transition-all duration-300"
                      opacity={isHovered ? 1 : 0.85}
                    />
                  )}

                  {/* Role Filter: Teachers Only */}
                  {roleFilter === "teachers" && (
                    <rect
                      x={x}
                      y={paddingTop + chartHeight - (d.teachers / maxTotal) * chartHeight}
                      width={barWidth}
                      height={(d.teachers / maxTotal) * chartHeight}
                      fill="#10B981"
                      rx="3"
                      className="transition-all duration-300"
                      opacity={isHovered ? 1 : 0.85}
                    />
                  )}

                  {/* X Axis Label */}
                  <text
                    x={x + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    className={`text-[9px] font-medium transition-colors ${
                      isHovered
                        ? "fill-neutral-900 dark:fill-white font-bold"
                        : "fill-neutral-400 dark:fill-neutral-500"
                    }`}
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {/* Floating Tooltip */}
        {activeData && !isLoading && (
          <div className="absolute top-1 right-2 pointer-events-none p-2.5 rounded-xl bg-neutral-900/95 dark:bg-black/95 text-white shadow-xl border border-neutral-700/80 backdrop-blur-md text-[11px] space-y-1">
            <div className="text-neutral-400 font-medium">{activeData.date}</div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {activeData.students} Learners
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeData.teachers} Instructors
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 pt-1 text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          <span>Learner Signups</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>Instructor Applicants</span>
        </div>
      </div>
    </div>
  )
}

export default AdminUserGrowthChart
