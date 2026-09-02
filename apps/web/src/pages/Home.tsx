import React from "react"
import { Hero } from "@/components/home/Hero"
import { Courses } from "@/components/home/Courses"
import { Features } from "@/components/home/Features"

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <Courses />
      <Features />
    </div>
  )
}
