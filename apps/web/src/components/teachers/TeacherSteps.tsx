import React from "react"
import {
  TEACHER_STEPS_HEADER,
  TEACHER_STEPS,
} from "@/constants/teachers"

export const TeacherSteps: React.FC = () => {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 border-t border-neutral-200/40 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/40">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {TEACHER_STEPS_HEADER.title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto">
            {TEACHER_STEPS_HEADER.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEACHER_STEPS.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/80 p-8 space-y-4"
            >
              <div className="text-4xl font-black text-[#F42A18]/30">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
