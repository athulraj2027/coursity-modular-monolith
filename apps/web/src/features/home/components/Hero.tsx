import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { HERO_CONTENT, type HeroConfig } from "../constants/home.constants"
import { NeuralFlowField } from "./NeuralFlowField"
import { ArrowRight, Mic, Video, Sparkles } from "lucide-react"

export interface HeroProps {
  content?: Partial<HeroConfig>
}

export const Hero: React.FC<HeroProps> = ({ content }) => {
  const data = { ...HERO_CONTENT, ...content }
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Progress from 0 to 1 over first 180px of scroll
  const progress = Math.min(1, Math.max(0, scrollY / 180))

  // Compute smooth glide towards navbar top-left position
  const scale = 1 - progress * 0.82
  const translateY = -progress * 110
  const translateX = -progress * 42
  const heroOpacity = Math.max(0, 1 - progress * 1.15)
  const subOpacity = Math.max(0, 1 - progress * 2.2)
  const bgOpacity = Math.max(0, 1 - progress * 1.4)

  return (
    <section className="relative isolate w-full overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-3.75rem)] py-12">
      {/* Interactive Neural Particle Flow Field in the background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: bgOpacity }}
      >
        <NeuralFlowField />
      </div>

      <div className="w-full max-w-full px-2 sm:px-4 flex flex-col items-center relative z-10">
        {/* Full-width brand headline morphing towards the top-left navbar */}
        <div
          className="w-full flex justify-center items-center transform-gpu will-change-transform pointer-events-none select-none"
          style={{
            transform: `translate(${translateX}vw, ${translateY}px) scale(${scale})`,
            transformOrigin: "center center",
            opacity: heroOpacity,
          }}
        >
          <h1 className="w-full text-center font-bold tracking-tight text-[18.2vw] leading-[0.82] text-neutral-900 dark:text-white transition-colors">
            {data.brandName}
          </h1>
        </div>

        {/* Dynamic subheading */}
        <p
          className="mt-8 md:mt-12 max-w-2xl text-center text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-normal tracking-wide px-4 leading-relaxed transition-opacity"
          style={{ opacity: subOpacity }}
        >
          {data.subheading}
        </p>

        {/* Hero Actions & Quick CTAs */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 px-4 transition-opacity"
          style={{ opacity: subOpacity }}
        >
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#F42A18] text-white text-sm font-semibold hover:bg-[#d92211] transition-all shadow-lg shadow-[#F42A18]/25 cursor-pointer"
          >
            <span>Explore Engineering Tracks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/teachers"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs text-neutral-800 dark:text-neutral-200 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span>Teach & Earn 85%</span>
          </Link>
        </div>

        {/* Capability Badges */}
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4 transition-opacity"
          style={{ opacity: subOpacity }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
            <Mic className="w-3.5 h-3.5 text-[#F42A18]" />
            Real-time AI Voice Interviews
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
            <Video className="w-3.5 h-3.5 text-blue-500" />
            Live HD Classrooms & Chat
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Production-Grade Curriculum
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
