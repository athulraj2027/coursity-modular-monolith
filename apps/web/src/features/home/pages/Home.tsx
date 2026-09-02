import React from "react"
import { Hero } from "../components/Hero"
import { Courses } from "../components/Courses"
import { Features } from "../components/Features"

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <Courses />
      <Features />
    </div>
  )
}

export default HomePage
