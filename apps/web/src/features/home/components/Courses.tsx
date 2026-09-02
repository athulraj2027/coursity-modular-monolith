import React, { useState } from "react"
import {
  COURSE_CATEGORIES,
  FEATURED_COURSES,
  type Course,
} from "../constants/courses.constants"
import {
  BookOpen,
  ArrowRight,
  Clock,
  Code2,
  Star,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

export const Courses: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const filteredCourses =
    activeCategory === "All"
      ? FEATURED_COURSES
      : FEATURED_COURSES.filter((course) => course.category === activeCategory)

  return (
    <section className="w-full py-24 sm:py-32 px-4 sm:px-6 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
              Engineered for <span className="text-[#F42A18]">Builders</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Deep-dive, project-based engineering tracks designed to take you from core primitives to distributed production systems.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200/70 dark:border-neutral-800">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#F42A18] text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredCourses.map((course: Course) => (
            <div
              key={course.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/60 p-6 sm:p-8 transition-all duration-300 hover:border-[#F42A18]/60 hover:shadow-xl hover:shadow-[#F42A18]/5"
            >
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
                    {course.category}
                  </span>
                  <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3 group-hover:text-[#F42A18] transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-800/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Metrics & CTA */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-medium text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-[#F42A18]" />
                    {course.projectsCount} Projects
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.studentsCount}
                  </span>
                </div>

                <Link
                  to={`/courses`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-[#F42A18] transition-colors"
                >
                  Explore Track
                  <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F42A18]/10 text-[#F42A18]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Looking for tailored tracks?
              </h4>
              <p className="text-xs text-neutral-500">
                Explore our full syllabus covering frontend, backend, AI, and DevOps.
              </p>
            </div>
          </div>
          <Link
            to="/courses"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:bg-[#F42A18] dark:hover:bg-[#F42A18] dark:hover:text-white transition-colors text-center"
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Courses
