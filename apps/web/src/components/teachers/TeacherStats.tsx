import React from "react"
import { TEACHER_STATS } from "@/constants/teachers"

export const TeacherStats: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 border-t border-neutral-200/40 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEACHER_STATS.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/80 p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:border-[#F42A18]/50 transition-all duration-300"
            >
              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F42A18] mb-1">
                  {stat.metric}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                  {stat.metricLabel}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                  {stat.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
