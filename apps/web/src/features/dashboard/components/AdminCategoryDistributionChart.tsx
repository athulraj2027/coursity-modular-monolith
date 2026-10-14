import React, { useState, useMemo } from "react"
import { Layers } from "lucide-react"
import type { CategoryDistributionItem } from "../../types/user-management.types"

export type CategoryPricingFilter = "all" | "paid" | "free"
export type CategoryStatusFilter = "all" | "published" | "draft"

interface AdminCategoryDistributionChartProps {
  totalCourses?: number
  items?: CategoryDistributionItem[]
  isLoading?: boolean
}

export const AdminCategoryDistributionChart: React.FC<AdminCategoryDistributionChartProps> = ({
  totalCourses = 36,
  items,
  isLoading = false,
}) => {
  const [pricingFilter, setPricingFilter] = useState<CategoryPricingFilter>("all")
  const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>("all")
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  // Default color palette for tech domains
  const palette = useMemo(() => [
    "#F42A18", // Coursity Red
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Purple
    "#F59E0B", // Amber
    "#EC4899", // Pink
  ], [])

  // Construct category distribution data from real backend items
  const rawCategories: CategoryDistributionItem[] = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((cat, idx) => ({
        ...cat,
        color: cat.color || palette[idx % palette.length],
      }))
    }

    // Default rich tech curriculum domains if empty
    return [
      {
        id: "cat-1",
        name: "Distributed Systems & Rust",
        slug: "distributed-systems",
        count: 14,
        color: palette[0],
        paidCount: 11,
        freeCount: 3,
        publishedCount: 12,
        draftCount: 2,
      },
      {
        id: "cat-2",
        name: "AI Agents & LLM Fine-Tuning",
        slug: "ai-agents",
        count: 11,
        color: palette[1],
        paidCount: 9,
        freeCount: 2,
        publishedCount: 9,
        draftCount: 2,
      },
      {
        id: "cat-3",
        name: "Cloud Native & Kubernetes",
        slug: "cloud-native",
        count: 8,
        color: palette[2],
        paidCount: 6,
        freeCount: 2,
        publishedCount: 7,
        draftCount: 1,
      },
      {
        id: "cat-4",
        name: "Full Stack & Next.js Core",
        slug: "full-stack",
        count: 6,
        color: palette[3],
        paidCount: 4,
        freeCount: 2,
        publishedCount: 5,
        draftCount: 1,
      },
      {
        id: "cat-5",
        name: "Cybersecurity & Cryptography",
        slug: "cybersecurity",
        count: 4,
        color: palette[4],
        paidCount: 3,
        freeCount: 1,
        publishedCount: 3,
        draftCount: 1,
      },
    ]
  }, [items, palette])

  // Filter category counts according to pricing & status filters
  const filteredData = useMemo(() => {
    return rawCategories.map((item) => {
      let filteredCount = item.count

      if (pricingFilter === "paid") filteredCount = item.paidCount
      else if (pricingFilter === "free") filteredCount = item.freeCount

      if (statusFilter === "published") {
        filteredCount = Math.min(filteredCount, item.publishedCount)
      } else if (statusFilter === "draft") {
        filteredCount = Math.min(filteredCount, item.draftCount)
      }

      return {
        ...item,
        displayCount: Math.max(1, filteredCount),
      }
    })
  }, [rawCategories, pricingFilter, statusFilter])

  const totalFilteredCount = useMemo(() => {
    return filteredData.reduce((acc, c) => acc + c.displayCount, 0)
  }, [filteredData])

  // SVG Geometry for Donut Arc Segments
  const size = 200
  const center = size / 2
  const radius = 78
  const strokeWidth = 22

  const circumference = 2 * Math.PI * radius

  // Calculate DashArrays and Offsets for SVG Circle Segments
  let accumulatedOffset = 0
  const arcs = filteredData.map((item) => {
    const ratio = totalFilteredCount > 0 ? item.displayCount / totalFilteredCount : 0
    const dashLength = ratio * circumference
    const spaceLength = circumference - dashLength
    const strokeDashoffset = -accumulatedOffset
    const percentage = Math.round(ratio * 100)

    accumulatedOffset += dashLength

    return {
      ...item,
      dashLength,
      spaceLength,
      strokeDashoffset,
      percentage,
    }
  })

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 space-y-4 text-left shadow-xs flex flex-col justify-between">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F42A18]/10 text-[#F42A18]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Domain & Category Catalog Share
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real curriculum concentration across specialized technical verticals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-xs">
            {(
              [
                { key: "all", label: "All Pricing" },
                { key: "paid", label: "Paid" },
                { key: "free", label: "Free" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPricingFilter(tab.key)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  pricingFilter === tab.key
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 text-xs">
            {(
              [
                { key: "all", label: "All Status" },
                { key: "published", label: "Live" },
                { key: "draft", label: "Drafts" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#F42A18] text-white shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Donut Chart & Legend Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
        {/* Donut Graphic */}
        <div className="md:col-span-5 flex items-center justify-center relative select-none">
          {isLoading ? (
            <div className="w-44 h-44 rounded-full bg-neutral-100 dark:bg-neutral-800/40 animate-pulse flex items-center justify-center text-xs text-neutral-400">
              Loading...
            </div>
          ) : (
            <svg viewBox={`0 0 ${size} ${size}`} className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-neutral-100 dark:text-neutral-800/80"
              />

              {/* Render Category Arc Segments */}
              {arcs.map((arc, idx) => {
                const isHovered = hoveredSlug === arc.slug
                return (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={arc.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${arc.dashLength} ${arc.spaceLength}`}
                    strokeDashoffset={arc.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    opacity={hoveredSlug === null || isHovered ? 1 : 0.45}
                    onMouseEnter={() => setHoveredSlug(arc.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  />
                )
              })}
            </svg>
          )}

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-white">
              {totalFilteredCount || totalCourses}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
              Tracks Active
            </span>
          </div>
        </div>

        {/* Category Share Breakdown List */}
        <div className="md:col-span-7 space-y-2.5">
          {arcs.map((item, idx) => {
            const isHovered = hoveredSlug === item.slug
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSlug(item.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered
                    ? "border-neutral-400 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-950/80 shadow-xs"
                    : "border-neutral-100 dark:border-neutral-800/60 bg-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {item.paidCount} Paid • {item.freeCount} Free
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                    {item.displayCount} Tracks
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryDistributionChart
