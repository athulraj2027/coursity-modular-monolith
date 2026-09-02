import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: (event?: React.MouseEvent<HTMLElement> | MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "coursity-theme"

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark",
  storageKey = THEME_STORAGE_KEY,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === "light" || stored === "dark") {
        return stored
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    document.body.classList.remove("light", "dark")
    document.body.classList.add(theme)
    root.style.colorScheme = theme

    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, storageKey])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = (event?: React.MouseEvent<HTMLElement> | MouseEvent) => {
    // If no click event, no view transitions API, or reduced motion preference
    if (
      !event ||
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
      return
    }

    const x = event.clientX
    const y = event.clientY

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Generate uneven organic polygon keyframe shapes centered at (x, y)
    const generateOrganicPolygon = (scale: number, phase: number) => {
      if (scale === 0) {
        return `circle(0px at ${x}px ${y}px)`
      }
      const points: string[] = []
      const numPoints = 20
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI
        // Multi-frequency organic uneven perturbation
        const wobble =
          1 +
          0.2 * Math.sin(3 * angle + phase) +
          0.12 * Math.cos(5 * angle - phase * 1.4) +
          0.08 * Math.sin(7 * angle + phase * 0.8)
        const r = scale * endRadius * wobble
        const px = x + Math.cos(angle) * r
        const py = y + Math.sin(angle) * r
        points.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`)
      }
      return `polygon(${points.join(", ")})`
    }

    // Trigger View Transition with uneven ripple expansion
    const transition = (document as any).startViewTransition(() => {
      setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            generateOrganicPolygon(0, 0),
            generateOrganicPolygon(0.25, 1.2),
            generateOrganicPolygon(0.58, 2.5),
            generateOrganicPolygon(0.92, 3.8),
            generateOrganicPolygon(1.4, 5.2),
          ],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
