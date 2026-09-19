import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, Check, Globe } from "lucide-react"
import { COUNTRIES_LIST, type CountryOption, getCountryByName } from "@/features/profile/constants/countries.constants"
import { cn } from "@/lib/utils"

export interface CountrySelectProps {
  id?: string
  value?: string
  onChange: (countryName: string, country: CountryOption) => void
  disabled?: boolean
  error?: boolean
  placeholder?: string
  className?: string
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = "Select your country",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = getCountryByName(value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const filteredCountries = COUNTRIES_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (country: CountryOption) => {
    onChange(country.name, country)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-xl border bg-transparent px-3 py-1.5 text-xs sm:text-sm text-neutral-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[#F42A18] focus:ring-[#F42A18]/20 focus:border-[#F42A18]"
            : "border-neutral-200 dark:border-neutral-800 focus:ring-[#F42A18]/20 focus:border-[#F42A18]",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedCountry ? (
            <>
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="truncate font-medium">{selectedCountry.name}</span>
              <span className="text-[11px] text-neutral-400">({selectedCountry.dialCode})</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-neutral-400">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[240px] max-h-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-52">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCountry?.code === country.code
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <span className="text-base shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                      <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                        {country.dialCode}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F42A18] shrink-0" />}
                  </button>
                )
              })
            ) : (
              <p className="text-center py-4 text-xs text-neutral-400">No countries matching "{search}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
