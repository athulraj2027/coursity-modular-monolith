import React from "react"
import { TeacherHero } from "@/components/teachers/TeacherHero"
import { TeacherStats } from "@/components/teachers/TeacherStats"
import { TeacherFeatures } from "@/components/teachers/TeacherFeatures"
import { TeacherSteps } from "@/components/teachers/TeacherSteps"

export const TeachersPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <TeacherHero />
      <TeacherStats />
      <TeacherFeatures />
      <TeacherSteps />
    </div>
  )
}
