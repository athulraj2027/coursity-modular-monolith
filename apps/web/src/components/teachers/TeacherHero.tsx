import React from "react"
import { TEACHER_HERO } from "@/constants/teachers"
import { Check } from "lucide-react"
import { TeacherSignupForm } from "./TeacherSignupForm"

export const TeacherHero: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-0 -z-10 opacity-50"
      >
        <div className="h-[450px] w-[50vw] rounded-full bg-gradient-to-tr from-[#F42A18]/15 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left side: Heading, Subtitle & Key Points */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              {TEACHER_HERO.titleMain} <br className="hidden sm:inline" />
              <span className="text-[#F42A18]">{TEACHER_HERO.titleHighlight}</span>
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl font-normal">
              {TEACHER_HERO.subtitle}
            </p>

            {/* Quick Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 w-full">
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
          </div>

          {/* Right side: Seamless Signup Form */}
          <div className="lg:col-span-5 w-full max-w-sm mx-auto lg:ml-auto">
            <TeacherSignupForm />
          </div>
        </div>
      </div>
    </section>
  )
}
