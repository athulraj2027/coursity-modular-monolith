import React from "react"
import { Link } from "react-router-dom"
import { TEACHER_HERO } from "../constants/teachers.constants"
import { ArrowRight, Check } from "lucide-react"

export const TeacherHero: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 lg:py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-0 -z-10 opacity-50"
      >
        <div className="h-[450px] w-[50vw] rounded-full bg-gradient-to-tr from-[#F42A18]/15 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left side: Heading, Subtitle, Highlights & Get Started Button */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              {TEACHER_HERO.titleMain} <br className="hidden sm:inline" />
              <span className="text-[#F42A18]">{TEACHER_HERO.titleHighlight}</span>
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl font-normal">
              {TEACHER_HERO.subtitle}
            </p>

            {/* Quick Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 w-full">
              {[
                "85% creator revenue share",
                "Automated AI lab grading",
                "Built-in browser live studio",
                "Direct Stripe weekly payouts",
              ].map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            {/* Get Started CTA in App Design */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4 w-full sm:w-auto">
              <Link
                to="/teachers/signup"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/teachers/signin"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <span>Sign In to Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeacherHero
