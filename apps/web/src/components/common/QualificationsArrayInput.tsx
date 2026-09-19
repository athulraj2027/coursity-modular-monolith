import React, { useState } from "react"
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  Building2,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QualificationItem } from "@/features/profile/types/profile.types"

export interface QualificationsArrayInputProps {
  id?: string
  label?: string
  value: QualificationItem[]
  onChange: (items: QualificationItem[]) => void
  disabled?: boolean
  error?: string | null
  maxItems?: number
}

export const QualificationsArrayInput: React.FC<QualificationsArrayInputProps> = ({
  id = "qualifications",
  label = "Qualifications & Academic Degrees / Experience",
  value = [],
  onChange,
  disabled = false,
  error,
  maxItems = 20,
}) => {
  const [newTitle, setNewTitle] = useState("")
  const [newInstitution, setNewInstitution] = useState("")
  const [newYear, setNewYear] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const handleAdd = () => {
    setLocalError(null)
    const titleTrimmed = newTitle.trim()
    const yearTrimmed = newYear.trim()
    const instTrimmed = newInstitution.trim()

    if (!titleTrimmed) {
      setLocalError("Please enter a Degree, Course, or Job title")
      return
    }

    if (!yearTrimmed) {
      setLocalError("Please specify a Year or Duration (e.g. 2022 or 2018 - 2022)")
      return
    }

    if (value.length >= maxItems) {
      setLocalError(`You can add at most ${maxItems} qualification entries`)
      return
    }

    const newItem: QualificationItem = {
      title: titleTrimmed,
      institution: instTrimmed || null,
      year: yearTrimmed,
    }

    onChange([...value, newItem])
    setNewTitle("")
    setNewInstitution("")
    setNewYear("")
  }

  const handleRemove = (index: number) => {
    if (disabled) return
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3" id={id}>
      {/* Label Row with Top-Right Auth-Style Error Feedback */}
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#F42A18]" />
          <span>{label}</span>
          <span className="text-[#F42A18]">*</span>
          <span className="text-[11px] font-normal text-neutral-400">
            ({value.length}{maxItems ? `/${maxItems}` : ""})
          </span>
        </Label>
        {(error || localError) && (
          <span className="text-[11px] font-medium text-[#F42A18] animate-in fade-in slide-in-from-right-1 duration-150">
            {error || localError}
          </span>
        )}
      </div>

      {/* Existing Added Qualifications Cards */}
      {value.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {value.map((item, index) => (
            <div
              key={index}
              className="group relative flex items-start justify-between p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                <div className="p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-[#F42A18] shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {item.institution && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]" title={item.institution}>
                        <Building2 className="w-3 h-3 shrink-0 text-neutral-400" />
                        <span className="truncate">{item.institution}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-300">
                      <Calendar className="w-3 h-3 shrink-0 text-[#F42A18]" />
                      <span>{item.year}</span>
                    </span>
                  </div>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                  title="Remove entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No qualifications or work experiences added yet. Fill in the fields below and click{" "}
            <span className="font-semibold text-neutral-700 dark:text-neutral-200">+ Add Entry</span>.
          </p>
        </div>
      )}

      {/* New Entry Input Fields */}
      {!disabled && value.length < maxItems && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            {/* Degree / Course / Job Title */}
            <div className="sm:col-span-5">
              <Input
                placeholder="Course, Degree, or Job Title (e.g. B.S. in CS)"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value)
                  if (localError) setLocalError(null)
                }}
                onKeyDown={handleKeyDown}
                className="text-xs rounded-lg h-9"
              />
            </div>

            {/* University / Institute / Company */}
            <div className="sm:col-span-4">
              <Input
                placeholder="Institute / Company (Optional)"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-xs rounded-lg h-9"
              />
            </div>

            {/* Year / Period */}
            <div className="sm:col-span-3">
              <Input
                placeholder="Year (e.g. 2022 or 2018-2022)"
                value={newYear}
                onChange={(e) => {
                  setNewYear(e.target.value)
                  if (localError) setLocalError(null)
                }}
                onKeyDown={handleKeyDown}
                className="text-xs rounded-lg h-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              💡 Tip: Add both your degrees (e.g. B.Tech) and work experiences (e.g. Senior Engineer).
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="text-xs font-semibold gap-1.5 h-8 px-3 rounded-lg border-neutral-300 dark:border-neutral-700 hover:border-[#F42A18] hover:text-[#F42A18] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
export default QualificationsArrayInput
