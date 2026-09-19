import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, Search, Check } from "lucide-react"
import {
  COUNTRIES_LIST,
  type CountryOption,
  getCountryByName,
  getDialCodeForCountry,
  parsePhoneNumber,
} from "@/features/profile/constants/countries.constants"
import { cn } from "@/lib/utils"

export interface PhoneInputWithCountryProps {
  id?: string
  value?: string | null
  country?: string | null
  onChange: (fullNumber: string) => void
  onCountryChange?: (countryName: string) => void
  disabled?: boolean
  error?: boolean
  placeholder?: string
  className?: string
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  id,
  value,
  country,
  onChange,
  onCountryChange,
  disabled = false,
  error = false,
  placeholder = "555 019 2834",
  className,
}) => {
  const parsed = parsePhoneNumber(value, country)
  const [dialCode, setDialCode] = useState(parsed.dialCode)
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber)
  const [isDialOpen, setIsDialOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dialRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync dial code when parent country changes
  useEffect(() => {
    if (country) {
      const codeForCountry = getDialCodeForCountry(country)
      setDialCode(codeForCountry)
      if (nationalNumber) {
        onChange(`${codeForCountry} ${nationalNumber}`.trim())
      }
    }
  }, [country])

  // Sync when external value changes
  useEffect(() => {
    const updated = parsePhoneNumber(value, country)
    setDialCode(updated.dialCode)
    setNationalNumber(updated.nationalNumber)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialRef.current && !dialRef.current.contains(e.target as Node)) {
        setIsDialOpen(false)
      }
    }
    if (isDialOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDialOpen])

  const currentCountry =
    COUNTRIES_LIST.find((c) => c.dialCode === dialCode) ||
    getCountryByName(country) ||
    COUNTRIES_LIST[0]

  const handleNationalNumberChange = (raw: string) => {
    // Keep only digits and hyphens/spaces
    const cleaned = raw.replace(/[^\d\s\-()]/g, "")
    setNationalNumber(cleaned)
    if (!cleaned.trim()) {
      onChange("")
    } else {
      onChange(`${dialCode} ${cleaned}`.trim())
    }
  }

  const handleSelectDialCode = (selectedCountry: CountryOption) => {
    setDialCode(selectedCountry.dialCode)
    setIsDialOpen(false)
    setSearch("")
    if (onCountryChange && (!country || country !== selectedCountry.name)) {
      onCountryChange(selectedCountry.name)
    }
    if (nationalNumber.trim()) {
      onChange(`${selectedCountry.dialCode} ${nationalNumber}`.trim())
    }
  }

  const filtered = COUNTRIES_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className={cn(
        "relative flex h-9 w-full items-center rounded-xl border bg-transparent text-xs sm:text-sm transition-colors focus-within:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-[#F42A18] focus-within:ring-[#F42A18]/20 focus-within:border-[#F42A18]"
          : "border-neutral-200 dark:border-neutral-800 focus-within:ring-[#F42A18]/20 focus-within:border-[#F42A18]",
        className
      )}
    >
      {/* Dial Code Selector Button */}
      <div className="relative shrink-0" ref={dialRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsDialOpen(!isDialOpen)}
          className="flex h-9 items-center gap-1.5 px-2.5 rounded-l-xl bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 transition-colors border-r border-neutral-200 dark:border-neutral-800 cursor-pointer text-xs font-semibold"
          title="Select Country Calling Code"
        >
          <span className="text-sm leading-none">{currentCountry?.flag || "🌐"}</span>
          <span className="font-mono">{dialCode}</span>
          <ChevronDown className={cn("w-3 h-3 text-neutral-400 transition-transform", isDialOpen && "rotate-180")} />
        </button>

        {isDialOpen && (
          <div className="absolute top-full left-0 z-50 mt-1.5 w-64 max-h-60 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search code or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
              {filtered.map((c) => {
                const isSelected = c.dialCode === dialCode
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelectDialCode(c)}
                    className={cn(
                      "flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-[#F42A18]/10 text-[#F42A18] font-bold"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="text-sm shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                      <span className="text-[11px] font-mono text-neutral-400 shrink-0">{c.dialCode}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F42A18] shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* National Number Input */}
      <input
        id={id}
        type="tel"
        disabled={disabled}
        placeholder={placeholder}
        value={nationalNumber}
        onChange={(e) => handleNationalNumberChange(e.target.value)}
        className="h-full flex-1 bg-transparent px-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden disabled:cursor-not-allowed"
      />
    </div>
  )
}
