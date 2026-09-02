import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  NAV_LINKS,
  TEACHER_NAV_LINKS,
  type NavCalloutConfig,
} from "@/constants/navbar"
import { HERO_CONTENT } from "@/constants/home"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Navbar: React.FC = () => {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isTeachersRoute =
    location.pathname.startsWith("/teachers") ||
    new URLSearchParams(location.search).get("role") === "teacher"
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    new URLSearchParams(location.search).get("role") === "admin"
  const [scrolled, setScrolled] = useState(!isHome)

  const activeNavLinks = isTeachersRoute ? TEACHER_NAV_LINKS : NAV_LINKS

  // Track dismissed state for dynamic callouts
  const [dismissedKeys, setDismissedKeys] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    const allLinks = [...NAV_LINKS, ...TEACHER_NAV_LINKS]
    allLinks.forEach((link) => {
      if (link.callout?.storageKey) {
        try {
          state[link.callout.storageKey] =
            sessionStorage.getItem(link.callout.storageKey) === "true"
        } catch {
          // Ignore
        }
      }
    })
    return state
  })

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 140)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHome])

  const dismissCallout = (storageKey: string) => {
    setDismissedKeys((prev) => ({ ...prev, [storageKey]: true }))
    try {
      sessionStorage.setItem(storageKey, "true")
    } catch {
      // Ignore
    }
  }

  const renderCalloutPopup = (callout: NavCalloutConfig) => {
    const isDismissed = dismissedKeys[callout.storageKey]
    if (isDismissed) return null

    return (
      <div className="absolute right-0 top-full mt-3.5 w-72 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-black/15 dark:shadow-black/60 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Top Caret Arrow */}
        <div className="absolute -top-1.5 right-6 w-3.5 h-3.5 rotate-45 bg-white dark:bg-neutral-900 border-l border-t border-neutral-200 dark:border-neutral-800" />

        {/* Header with Title and Dismiss X button */}
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#F42A18]" />
            <span>{callout.title}</span>
            {callout.badge && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#F42A18]/10 text-[#F42A18] font-bold">
                {callout.badge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissCallout(callout.storageKey)}
            aria-label="Close notification"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3.5 relative z-10">
          {callout.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 relative z-10">
          <Link
            to={callout.ctaHref}
            onClick={() => dismissCallout(callout.storageKey)}
            className="flex-1 py-1.5 rounded-lg bg-[#F42A18] text-white text-xs font-semibold text-center hover:bg-[#d92211] transition-colors shadow-sm"
          >
            {callout.ctaText}
          </Link>
          <button
            type="button"
            onClick={() => dismissCallout(callout.storageKey)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {callout.dismissText}
          </button>
        </div>
      </div>
    )
  }

  return (
    <header className="bg-transparent z-50 sticky top-0 w-full">
      <div className="container mx-auto h-15 flex items-center justify-between px-6">
        {/* Brand logo on the left - emerges when scrolled past hero */}
        <Link
          to="/"
          className={cn(
            "flex items-center space-x-3 transition-all duration-300 ease-out",
            scrolled
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            {HERO_CONTENT.brandName}
          </span>
        </Link>

        {/* Theme toggle & Navigation options on the right */}
        <div className="flex items-center space-x-5 sm:space-x-6">
          <ThemeToggle />
          {!isAdminRoute && (
            <nav className="flex items-center space-x-5 sm:space-x-8">
              {activeNavLinks.map((link) => {
                // Highlighted / mobile visible option
                const isHighlight = isTeachersRoute
                  ? link.href === "/"
                  : link.href === "/teachers"
                const hasCallout = Boolean(link.callout)

                return (
                  <div
                    key={link.href}
                    className={cn(
                      "relative",
                      !isHighlight && "hidden min-[1001px]:inline-block"
                    )}
                  >
                    <Link
                      to={link.href}
                      className="text-sm font-medium text-neutral-800 dark:text-white hover:text-brand dark:hover:text-brand transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      <span>{link.label}</span>
                      {hasCallout && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F42A18] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F42A18]" />
                        </span>
                      )}
                    </Link>

                    {link.callout && renderCalloutPopup(link.callout)}
                  </div>
                )
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
