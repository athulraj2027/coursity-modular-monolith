import React, { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Initial or external search value */
  value?: string
  /** Fires immediately on every keystroke */
  onChange?: (value: string) => void
  /** Fires ONLY after the user pauses typing for `debounceDelay` ms (ideal for API queries) */
  onDebounce?: (debouncedValue: string) => void
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceDelay?: number
  /** Shows an animated loading spinner when API search is in flight */
  isLoading?: boolean
  /** Shows a keyboard shortcut badge (e.g. '⌘K' or '/') */
  shortcut?: string
  /** Container div className */
  containerClassName?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = "",
  onChange,
  onDebounce,
  debounceDelay = 300,
  isLoading = false,
  shortcut,
  placeholder = "Search...",
  className,
  containerClassName,
  disabled,
  ...inputProps
}) => {
  const [localQuery, setLocalQuery] = useState(value)
  const debouncedQuery = useDebounce(localQuery, debounceDelay)
  const isFirstMount = useRef(true)

  // Sync external controlled value updates (e.g., when parent resets filters)
  useEffect(() => {
    setLocalQuery(value)
  }, [value])

  // Emit debounced value to parent when typing settles
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    if (onDebounce) {
      onDebounce(debouncedQuery)
    }
  }, [debouncedQuery, onDebounce])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalQuery(val)
    if (onChange) {
      onChange(val)
    }
  }

  const handleClear = () => {
    setLocalQuery("")
    if (onChange) {
      onChange("")
    }
    if (onDebounce) {
      onDebounce("")
    }
  }

  return (
    <div className={cn("relative flex items-center min-w-[240px]", containerClassName)}>
      {/* Search or Loading Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#F42A18]" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      {/* Input Field */}
      <Input
        type="text"
        value={localQuery}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "pl-9.5 pr-8 h-10 text-xs sm:text-sm rounded-xl border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 focus-visible:ring-1 focus-visible:ring-[#F42A18] transition-colors",
          className
        )}
        {...inputProps}
      />

      {/* Clear Button / Shortcut Badge */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {localQuery && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-0.5 rounded-md cursor-pointer hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : shortcut ? (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 rounded">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    </div>
  )
}
