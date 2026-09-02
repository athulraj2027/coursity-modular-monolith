import React from "react"
import { useTheme } from "@/context/theme-context"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-lg  bg-white/50 text-neutral-800  hover:text-brand dark:bg-black/50 dark:text-neutral-200 dark:hover:text-brand cursor-pointer",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  )
}
