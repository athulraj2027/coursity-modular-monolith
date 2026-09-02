import React from "react"
import {
  TEACHER_FEATURES_HEADER,
  TEACHER_FEATURES,
} from "@/constants/teachers"
import { Zap } from "lucide-react"

export const TeacherFeatures: React.FC = () => {
  return (
    <section id="features" className="w-full py-24 sm:py-32 px-4 sm:px-6 border-t border-neutral-200/40 dark:border-neutral-900">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20">
            <Zap className="w-3.5 h-3.5" />
            {TEACHER_FEATURES_HEADER.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {TEACHER_FEATURES_HEADER.titleMain}{" "}
            <span className="text-[#F42A18]">{TEACHER_FEATURES_HEADER.titleHighlight}</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {TEACHER_FEATURES_HEADER.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TEACHER_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="group rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/60 p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#F42A18]/60 hover:shadow-xl hover:shadow-[#F42A18]/5"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 mb-4">
                  {feat.badge}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-[#F42A18] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
