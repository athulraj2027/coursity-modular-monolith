import React from "react"
import { FEATURES_DATA } from "../constants/features.constants"
import { Check } from "lucide-react"

export const Features: React.FC = () => {
  return (
    <section className="w-full py-24 sm:py-32 px-4 sm:px-6 relative border-t border-neutral-200/40 dark:border-neutral-900">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20 space-y-4">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              Built for <span className="text-[#F42A18]">Mastery</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Accelerate your engineering journey with live mentor sessions, automated AI code reviews, and targeted concept assessments.
            </p>
          </div>
        </div>

        {/* Features 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES_DATA.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/60 p-8 sm:p-10 transition-all duration-300 hover:border-[#F42A18]/60 hover:shadow-xl hover:shadow-[#F42A18]/5"
            >
              <div>
                {/* Title & Subtitle */}
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2 group-hover:text-[#F42A18] transition-colors">
                  {item.title}
                </h3>
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">
                  {item.subtitle}
                </h4>

                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                  {item.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 space-y-3">
                {item.highlights.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F42A18]/10 text-[#F42A18] mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
