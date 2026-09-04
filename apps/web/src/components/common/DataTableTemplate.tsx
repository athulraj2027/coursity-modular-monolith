import type { ReactNode } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Inbox,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TableMetricCard {
  label: string
  val: string | number
  icon: LucideIcon
  color?: string
  change?: string
}

export interface TableTabOption {
  key: string
  label: string
  count?: number
}

export interface TableDropdownFilter {
  key: string
  label?: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}

export interface TableSortOption {
  label: string
  value: string
}

export interface TableColumn<T> {
  header: ReactNode
  accessorKey?: keyof T
  cell?: (row: T, index: number) => ReactNode
  align?: "left" | "center" | "right"
  className?: string
  headerClassName?: string
}

export interface DataTableTemplateProps<T> {
  // 1. Header Banner
  badge?: {
    icon?: LucideIcon
    label: string
  }
  title: string
  description?: string
  headerActions?: ReactNode

  // 2. Metrics (Optional)
  metrics?: TableMetricCard[]

  // 3. Search & Filter Bar
  searchPlaceholder?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void

  tabs?: TableTabOption[]
  activeTab?: string
  onTabChange?: (key: string) => void

  dropdownFilters?: TableDropdownFilter[]

  sortOptions?: TableSortOption[]
  currentSort?: string
  onSortChange?: (value: string) => void

  onResetFilters?: () => void
  hasActiveFilters?: boolean

  // 4. Data & Columns
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  emptyState?: {
    icon?: LucideIcon
    title?: string
    description?: string
  }

  // 5. Functional Pagination
  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
  }

  // 6. Modal / Detail Drawer
  modal?: ReactNode
}

export function DataTableTemplate<T>({
  badge,
  title,
  description,
  headerActions,
  metrics,
  searchPlaceholder = "Search records...",
  searchQuery = "",
  onSearchChange,
  tabs,
  activeTab,
  onTabChange,
  dropdownFilters,
  sortOptions,
  currentSort,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  pagination,
  modal,
}: DataTableTemplateProps<T>) {
  // Compute pagination parameters
  const currentPage = pagination?.currentPage || 1
  const pageSize = pagination?.pageSize || (data.length > 0 ? data.length : 10)
  const totalItems = pagination ? pagination.totalItems : data.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalItems)

  // Generate pagination numbers array with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const EmptyIcon = emptyState?.icon || Inbox

  return (
    <div className="flex flex-1 flex-col gap-6 w-full text-left">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 p-6 sm:p-7 text-left shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F42A18]/10 blur-3xl"
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
                {badge.icon && <badge.icon className="w-3.5 h-3.5" />}
                <span>{badge.label}</span>
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      </div>

      {/* 2. Metrics Cards (if provided) */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/40 space-y-1 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{metric.label}</span>
                  <Icon className={cn("w-4 h-4", metric.color || "text-[#F42A18]")} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  {metric.val}
                </div>
                {metric.change && (
                  <div className="text-[11px] text-neutral-400 font-medium">{metric.change}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/40">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9.5 h-10 text-xs sm:text-sm rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Controls (Tabs, Dropdowns, Sorting) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          {tabs && tabs.length > 0 && onTabChange && (
            <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/80 text-xs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer",
                    activeTab === tab.key
                      ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={cn(
                        "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                        activeTab === tab.key
                          ? "bg-[#F42A18]/15 text-[#F42A18] font-bold"
                          : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Custom Dropdown Filters */}
          {dropdownFilters?.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F42A18]"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Sort Dropdown */}
          {sortOptions && sortOptions.length > 0 && onSortChange && (
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F42A18]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters Option (if modified) */}
          {hasActiveFilters && onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-10 text-xs rounded-xl border-neutral-200 dark:border-neutral-800 text-[#F42A18] hover:bg-[#F42A18]/5"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 4. Table Body */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-900 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-900 bg-neutral-50/75 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 font-semibold uppercase text-[11px] tracking-wider">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "py-3.5 px-4",
                      idx === 0 && "sm:px-6",
                      idx === columns.length - 1 && "sm:px-6",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-900">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-[#F42A18] animate-spin" />
                      <p className="text-xs text-neutral-500 font-medium">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-neutral-500">
                    <EmptyIcon className="w-9 h-9 mx-auto mb-2 text-neutral-400 opacity-60" />
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {emptyState?.title || "No matching records found"}
                    </p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                      {emptyState?.description ||
                        "Try adjusting your search query, status filters, or reset filters to see results."}
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-3 text-xs text-[#F42A18] font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        Reset all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((item, rowIdx) => (
                  <tr
                    key={keyExtractor(item, rowIdx)}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
                  >
                    {columns.map((col, colIdx) => {
                      const cellContent = col.cell
                        ? col.cell(item, rowIdx)
                        : col.accessorKey
                        ? (item[col.accessorKey] as ReactNode)
                        : null

                      return (
                        <td
                          key={colIdx}
                          className={cn(
                            "py-4 px-4",
                            colIdx === 0 && "sm:px-6",
                            colIdx === columns.length - 1 && "sm:px-6",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.className
                          )}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Dynamic Functional Pagination Footer */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-neutral-200/80 dark:border-neutral-900 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-950/40">
            {/* Page Summary & Page Size Switcher */}
            <div className="flex items-center gap-3">
              <div>
                Showing{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {startRecord}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">{endRecord}</span>{" "}
                of{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {totalItems}
                </span>{" "}
                results
              </div>

              {pagination.onPageSizeChange && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span>Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-medium cursor-pointer"
                  >
                    {(pagination.pageSizeOptions || [5, 10, 20, 50]).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* Jump to first page */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={currentPage <= 1}
                title="First Page"
                className="h-7 w-7 p-0 rounded-lg border-neutral-200 dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>

              {/* Prev page */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                title="Previous Page"
                className="h-7 w-7 p-0 rounded-lg border-neutral-200 dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((p, pIdx) => {
                  if (typeof p === "string") {
                    return (
                      <span
                        key={`ellipsis-${pIdx}`}
                        className="px-1 text-neutral-400 select-none"
                      >
                        ...
                      </span>
                    )
                  }
                  const isCurrent = p === currentPage
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => pagination.onPageChange(p)}
                      className={cn(
                        "h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        isCurrent
                          ? "bg-[#F42A18] text-white shadow-xs"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>

              {/* Next page */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                title="Next Page"
                className="h-7 w-7 p-0 rounded-lg border-neutral-200 dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>

              {/* Jump to last page */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                title="Last Page"
                className="h-7 w-7 p-0 rounded-lg border-neutral-200 dark:border-neutral-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Modal / Detail Drawer Slot */}
      {modal}
    </div>
  )
}

export default DataTableTemplate
