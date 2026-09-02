import React, { useEffect, useState } from "react"
import { HERO_CONTENT, type HeroConfig } from "../constants/home.constants"
import { NeuralFlowField } from "./NeuralFlowField"

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
      </div>
    </section>
  )
}

export default Hero
